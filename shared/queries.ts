export const LIST_REPOSITORIES = `
  query ListRepositories {
    viewer {
      name
      repositories(first: 10, orderBy: { direction: DESC, field: STARGAZERS }) {
        nodes {
          name
          id
          url
          object(expression: "main") {
            ... on Commit {
              history {
                totalCount
              }
            }
          }
          stargazers {
            totalCount
          }
        }
      }
    }
  }`;
