import { gql } from "@apollo/client";

export const LIST_CLASSES = gql`
  query ListClasses {
    listClasses {
      results {
        id
        name
        level
        student {
          email
          name
        }
        teacher {
          email
          name
        }
      }
    }
  }
`;
