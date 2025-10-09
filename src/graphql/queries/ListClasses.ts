import { gql } from "@apollo/client";

export const LIST_CLASSES = gql`
  query ListClass {
    listClass {
      results {
        id
        languageId
        level
        name
        enrollments {
          student {
            name
            id
          }
        }
        language {
          name
        }
      }
    }
  }
`;
