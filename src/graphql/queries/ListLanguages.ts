import { gql } from "@apollo/client";

export const LIST_LANGUAGES = gql`
  query ListLanguages {
    listLanguages {
      results {
        id
        name
      }
    }
  }
`;
