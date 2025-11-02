import { gql } from "@apollo/client";

export const LIST_ENROLLMENTS = gql`
  query ListEnrollments {
    listEnrollments {
      results {
        id
        class_id
        studentId
        student {
          name
          phone
          email
        }
        class {
          name
          level
        }
      }
    }
  }
`;
