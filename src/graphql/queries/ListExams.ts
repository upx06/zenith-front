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
        results {
          totalScore
          id
          enrollmentId
          scores {
            feedback
            id
            resultId
            score
            feedback
            topicId
            topic {
              id
              name
            }
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
