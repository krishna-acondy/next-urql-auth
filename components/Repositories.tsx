import { Inter } from "@next/font/google";
import { useQuery } from "urql";
import styles from "../styles/Home.module.css";
import { ListRepositoriesResponse } from "../types";
import Repository from "./Repository";
import { LIST_REPOSITORIES } from "../pages/queries";

const inter = Inter({ subsets: ["latin"] });

function Repositories() {
  const [{ fetching, data }] = useQuery<ListRepositoriesResponse>({
    query: LIST_REPOSITORIES,
  });

  return (
    <>
      {fetching && <h3 className={inter.className}>Loading...</h3>}
      {!!data && (
        <>
          <h3 className={inter.className}>
            Repositories for {data.viewer.name}
          </h3>
          <ul className={`${styles.repositories} ${inter.className}`}>
            {(data.viewer.repositories.nodes || []).map((repo) => (
              <Repository repository={repo} key={repo.id} />
            ))}
          </ul>
        </>
      )}
    </>
  );
}

export default Repositories;
