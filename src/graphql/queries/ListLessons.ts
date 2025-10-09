import { gql } from "@apollo/client";

export const LIST_LESSON = gql`
  query ListLesson {
    listLesson {
      count
      endKeyset
      startKeyset
      results {
        id
        classId
        classroomId
        datetime
        teacherId
        teacher {
          id
          email
          name
          phone
        }
        class {
          id
          languageId
          level
          name
          language {
            id
            description
            name
          }
        }
        classroom {
          id
          capacity
          name
        }
      }
    }
  }
`;
