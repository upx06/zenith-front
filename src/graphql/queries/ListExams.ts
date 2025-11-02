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
        }
        enrollment {
          id
          student {
            name
          }
        }
        results {
          totalScore
          id
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
