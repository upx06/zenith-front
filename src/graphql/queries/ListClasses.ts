import { gql } from "@apollo/client";

export const LIST_CLASSES = gql`
  query ListClasses {
    listClasses {
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
