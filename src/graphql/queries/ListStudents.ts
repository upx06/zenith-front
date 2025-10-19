import { gql } from "@apollo/client";

export const LIST_STUDENTS = gql`
  query ListStudents {
    listStudents {
      results {
        email
        id
        name
        phone
        enrollment {
          class {
            level
            name
            language {
              name
            }
          }
        }
      }
    }
  }
`;
