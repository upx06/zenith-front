import { gql } from "@apollo/client";

export const LIST_CLASSROOMS = gql`
  query ListClassrooms(
    $after: String
    $before: String
    $filter: ClassroomFilterInput
  ) {
    listClassrooms(after: $after, before: $before, filter: $filter) {
      count
      endKeyset
      startKeyset
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
