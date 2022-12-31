import { LoadingButton } from "@mui/lab";
import {
  Tabs,
  Tab,
  Typography,
  FormControl,
  Input,
  InputLabel,
  Stack,
  Box,
  CircularProgress,
  Button,
  Alert,
} from "@mui/material";
import React from "react";
import { gql, useMutation } from "urql";

const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    signin(input: $input) {
      refreshToken
      token
    }
  }
`;

const REGISTER_MUTATION = gql`
  mutation Register($input: LoginInput!) {
    register(input: $input) {
      refreshToken
      token
    }
  }
`;

type Credentials = {
  token: string;
  refreshToken: string;
};

type SignInResponse = {
  signin: Credentials;
};

type RegisterResponse = {
  register: Credentials;
};

type LoginProps = {
  onLogin: (creds: Credentials) => any;
};

const Login = ({ onLogin }: LoginProps) => {
  const [tab, setTab] = React.useState("login");
  const [{ fetching: isLoggingIn, error: loginError }, login] =
    useMutation<SignInResponse>(LOGIN_MUTATION);
  const [{ fetching: isRegistering, error: registerError }, register] =
    useMutation<RegisterResponse>(REGISTER_MUTATION);

  const onSubmitLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.target as HTMLFormElement);
    const username = data.get("username");
    const password = data.get("password");

    login({ input: { username, password } }).then((result) => {
      if (!result.error && result.data && result.data.signin) {
        onLogin(result.data.signin);
      }
    });
  };

  const onSubmitRegister = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.target as HTMLFormElement);
    const username = data.get("username");
    const password = data.get("password");

    register({ input: { username, password } }).then((result) => {
      if (!result.error && result.data && result.data.register) {
        onLogin(result.data.register);
      }
    });
  };

  return (
    <Stack
      sx={{
        width: "100vw",
        height: "100vh",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          border: (theme) => `1px solid ${theme.palette.grey[300]}`,
          borderRadius: 1,
          p: 2,
          minWidth: 400,
        }}
      >
        <Tabs value={tab} onChange={(e, value) => setTab(value)}>
          <Tab label="Log In" value="login" />
          <Tab label="Register" value="register" />
        </Tabs>
        {tab === "login" && (
          <form onSubmit={onSubmitLogin}>
            <Stack p={2} gap={2}>
              {loginError && (
                <Alert severity="error">{loginError.message}</Alert>
              )}
              <Typography variant="h5">Log in</Typography>
              <FormControl variant="standard">
                <InputLabel htmlFor="username">Username</InputLabel>
                <Input id="username" name="username" defaultValue="" />
              </FormControl>
              <FormControl variant="standard">
                <InputLabel htmlFor="password">Password</InputLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  defaultValue=""
                />
              </FormControl>
              <Button
                startIcon={
                  isLoggingIn ? <CircularProgress size={16} /> : undefined
                }
                disabled={isLoggingIn}
                type="submit"
              >
                Log In
              </Button>
            </Stack>
          </form>
        )}

        {tab === "register" && (
          <form onSubmit={onSubmitRegister}>
            <Stack p={2} gap={2}>
              {registerError && (
                <Alert severity="error">{registerError.message}</Alert>
              )}
              <Typography variant="h5">Register</Typography>
              <FormControl variant="standard">
                <InputLabel htmlFor="username">Username</InputLabel>
                <Input id="username" name="username" defaultValue="" />
              </FormControl>
              <FormControl variant="standard">
                <InputLabel htmlFor="password">Password</InputLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  defaultValue=""
                />
              </FormControl>
              <LoadingButton
                loadingIndicator="Registering..."
                loading={isRegistering}
                disabled={isRegistering}
                type="submit"
              >
                Register
              </LoadingButton>
            </Stack>
          </form>
        )}
      </Box>
    </Stack>
  );
};

export default Login;
