import { gql } from "@apollo/client";

export const LIST_CLASSROOMS = gql`
  query ListClassrooms {
    listClassrooms {
      results {
        capacity
        id
        name
        lesson {
          datetime
          id
          class {
            languageId
            level
            name
          }
          teacher {
            name
            phone
          }
        }
      }
    }
  }
`;
