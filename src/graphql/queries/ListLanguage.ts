import { gql } from "@apollo/client";

export const LIST_LANGUAGES = gql`
  query ListLanguage {
    listLanguage {
      results {
        id
        name
      }
    }
  }
`;
