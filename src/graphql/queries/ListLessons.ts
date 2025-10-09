import { gql } from "@apollo/client";

export const LIST_LESSON = gql`
  query ListLessons($startDate: UtcDatetime!, $endDate: UtcDatetime!) {
    listLesson(
      filter: {
        and: [
          { datetime: { greaterThanOrEqual: $startDate } }
          { datetime: { lessThanOrEqual: $endDate } }
        ]
      }
    ) {
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
