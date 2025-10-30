import { gql } from "@apollo/client";

export const LIST_ALL_LESSONS = gql`
  query ListAllLessons(
    $after: String
    $before: String
    $filter: LessonFilterInput
  ) {
    listLessons(after: $after, before: $before, filter: $filter) {
      count
      endKeyset
      startKeyset
      results {
        id
        classId
        classroomId
        datetime
        attendanceTaken
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
          enrollments {
            id
            studentId
            classId
            student {
              id
              name
              email
              phone
              photoKey
            }
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
