import {
  makeOperation,
  dedupExchange,
  fetchExchange,
  cacheExchange,
  gql,
  TypedDocumentNode,
  OperationResult,
  Operation,
  CombinedError,
} from "urql";

import { authExchange } from "@urql/exchange-auth";
import {
  getToken,
  getRefreshToken,
  saveAuthState,
  clearAuthState,
  AuthState,
} from "./auth";
import { SSRExchange } from "next-urql";
import jwtDecode from "jwt-decode";

const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshCredentials($refreshToken: String!) {
    refreshCredentials(refreshToken: $refreshToken) {
      refreshToken
      token
    }
  }
`;

let initialized = new Date().getTime();

export const clientOptions = (ssrExchange: SSRExchange) => ({
  url: "https://trygql.formidable.dev/graphql/web-collections",
  exchanges: [
    dedupExchange,
    cacheExchange,
    ssrExchange,
    authExchange<AuthState>({
      getAuth,
      addAuthToOperation,
      didAuthError,
      willAuthError,
    }),
    fetchExchange,
  ],
});

type RefreshCredentialsInput = {
  refreshToken: string;
};

type GetAuthInput = {
  authState: AuthState;
  mutate<AuthState, Variables = RefreshCredentialsInput>(
    query: TypedDocumentNode<AuthState, Variables>,
    variables: Variables
  ): Promise<OperationResult<AuthState, {}>>;
};

async function getAuth({ authState, mutate }: GetAuthInput) {
  if (!authState) {
    const token = getToken();
    const refreshToken = getRefreshToken();

    if (token && refreshToken) {
      return { token, refreshToken };
    }

    return null;
  }

  const result = await mutate(REFRESH_TOKEN_MUTATION, {
    refreshToken: authState.refreshToken,
  });

  if (result.data?.refreshCredentials) {
    saveAuthState(result.data.refreshCredentials);

    initialized = new Date().getTime();
    return result.data.refreshCredentials;
  }

  // This is where auth has gone wrong and we need to clean up and redirect to a login page
  clearAuthState();
  window.location.reload();

  return null;
}

type AddAuthToOperationInput = {
  authState: AuthState;
  operation: Operation<any, any>;
};

function addAuthToOperation({ authState, operation }: AddAuthToOperationInput) {
  if (!authState || !authState.token) {
    return operation;
  }

  const fetchOptions =
    typeof operation.context.fetchOptions === "function"
      ? operation.context.fetchOptions()
      : operation.context.fetchOptions || {};

  return makeOperation(operation.kind, operation, {
    ...operation.context,
    fetchOptions: {
      ...fetchOptions,
      headers: {
        ...fetchOptions.headers,
        Authorization: `Bearer ${authState.token}`,
      },
    },
  });
}

type DidAuthErrorInput = {
  error: CombinedError;
  authState: AuthState | null;
};

function didAuthError({ error }: DidAuthErrorInput) {
  return error.graphQLErrors.some((e) => e.extensions?.code === "UNAUTHORIZED");
}

type WillAuthErrorInput = {
  operation: Operation<any, any>;
  authState: AuthState | null;
};

function willAuthError({ operation, authState }: WillAuthErrorInput) {
  if (!authState) {
    return !(
      operation.kind === "mutation" &&
      operation.query.definitions.some((definition) => {
        return (
          definition.kind === "OperationDefinition" &&
          definition.selectionSet.selections.some((node) => {
            return (
              node.kind === "Field" &&
              (node.name.value === "login" || node.name.value === "register")
            );
          })
        );
      })
    );
  } else {
    const decoded = jwtDecode<{ exp: number }>(getToken() as string);
    const isExpiring = decoded.exp * 1000 - new Date().getTime() <= 5000;
    return operation.kind === "query" && isExpiring;
  }
}
