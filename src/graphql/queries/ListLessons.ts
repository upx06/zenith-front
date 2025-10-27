import { gql } from "@apollo/client";

export const LIST_LESSONS = gql`
  query ListLessons($startDate: DateTime!, $endDate: DateTime!) {
    listLessons(
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
