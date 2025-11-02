import { gql } from "@apollo/client";

export const LIST_STUDENTS = gql`
  query ListStudents(
    $after: String
    $before: String
    $filter: StudentFilterInput
  ) {
    listStudents(after: $after, before: $before, filter: $filter) {
      count
      endKeyset
      startKeyset
      results {
        email
        id
        name
        phone
        photoKey
        goal
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
