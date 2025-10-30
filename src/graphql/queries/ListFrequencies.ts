import { gql } from "@apollo/client";

export const LIST_FREQUENCIES = gql`
  query ListFrequencies(
    $after: String
    $before: String
    $filter: FrequencyFilterInput
  ) {
    listFrequencies(after: $after, before: $before, filter: $filter) {
      count
      endKeyset
      startKeyset
      results {
        id
        attendance
        enrollmentId
        lessonId
        enrollment {
          id
          student {
            id
            name
            email
            phone
            photoKey
          }
          class {
            id
            name
            level
            language {
              id
              name
            }
          }
        }
        lesson {
          id
          datetime
          teacher {
            id
            name
          }
          class {
            id
            name
            level
          }
          classroom {
            id
            name
          }
        }
      }
    }
  }
`;
