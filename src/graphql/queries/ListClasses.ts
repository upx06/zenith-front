import { gql } from "@apollo/client";

export const LIST_CLASSES = gql`
  query ListClasses(
    $after: String
    $before: String
    $filter: ClassFilterInput
  ) {
    listClasses(after: $after, before: $before, filter: $filter) {
      count
      endKeyset
      startKeyset
      results {
        id
        languageId
        level
        name
        lessons {
          classId
          classroomId
          datetime
          id
          teacherId
          classroom {
            name
          }
          teacher {
            name
          }
          class {
            name
            level
          }
        }
        language {
          name
        }
        enrollments {
          student {
            name
            id
          }
        }
      }
    }
  }
`;
