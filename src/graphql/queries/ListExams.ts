import { gql } from "@apollo/client";

export const LIST_EXAMS = gql`
  query ListExams {
    listExams {
      count
      endKeyset
      startKeyset
      results {
        id
        classId
        name
        enrollmentId
        class {
          languageId
          level
          name
          enrollments {
            id
            student {
              name
              email
            }
          }
        }
        enrollment {
          id
          student {
            name
            email
          }
        }
        scores {
          id
          score
          feedback
          topicId
          enrollmentId
          topic {
            id
            name
          }
        }
        topics {
          id
          name
        }
        teacher {
          id
          name
        }
      }
    }
  }
`;
