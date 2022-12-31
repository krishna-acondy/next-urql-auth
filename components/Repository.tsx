import { Inter } from "@next/font/google";
import styles from "../styles/Home.module.css";
import { useMutation } from "urql";
import {
  CreateIssueResponse,
  CreateRepositoryVariables,
  Repository,
} from "../types";

const inter = Inter({ subsets: ["latin"] });

const CREATE_ISSUE = `
  mutation CreateIssue($repositoryId: ID!, $title: String!, $body: String!) {
    createIssue(input: {repositoryId: $repositoryId, title: $title, body: $body}) {
      issue {
        number
        body
        title
      }
    }
  }
`;

type RepositoryProps = {
  repository: Repository;
};

export default function Repo({ repository }: RepositoryProps) {
  const [{ fetching, data: createResponse }, createIssue] = useMutation<
    CreateIssueResponse,
    CreateRepositoryVariables
  >(CREATE_ISSUE);

  return (
    <li key={repository.id}>
      <div className={styles.repositoryName}>
        <a href={repository.url} target="_blank" rel="noopener noreferrer">
          <h4 className={inter.className}>{repository.name}</h4>
        </a>
        <button
          className={styles.createIssue}
          onClick={async () => {
            await createIssue({
              repositoryId: repository.id,
              title: "This is a test issue",
              body: "Test issue body",
            });
          }}
        >
          + Create Issue
        </button>
      </div>
      <div className={styles.stats}>
        <span className={inter.className}>
          ⭐️ {repository.stargazers.totalCount}
        </span>
        <span className={inter.className}>
          💾 {repository.object?.history?.totalCount ?? 0}
        </span>
      </div>
    </li>
  );
}
