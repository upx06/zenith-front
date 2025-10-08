import { gql } from "@apollo/client";

export const LIST_CLASSES = gql`
  query ListClass {
    listClass {
      results {
        id
        name
        level
      }
    }
  }
`;
