import { gql } from "@apollo/client";

export const LIST_FREQUENCIES_BY_CLASS = gql`
  query ListFrequenciesByClass($classId: ID!) {
    listFrequencies(
      filter: { enrollment: { classId: { eq: $classId } } }
    ) {
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
          studentId
          student {
            id
            name
          }
        }
        lesson {
          id
          datetime
          classId
        }
      }
    }
  }
`;
