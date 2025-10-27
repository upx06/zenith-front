import { gql } from "@apollo/client";

export const LIST_TEACHERS = gql`
  query ListTeachers(
    $after: String
    $before: String
    $filter: TeacherFilterInput
  ) {
    listTeachers(after: $after, before: $before, filter: $filter) {
      count
      endKeyset
      startKeyset
      results {
        email
        id
        name
        phone
        photoKey
        lessons {
          datetime
          id
          class {
            languageId
            level
            name
          }
          classroom {
            capacity
            id
            name
          }
        }
      }
    }
  }
`;
