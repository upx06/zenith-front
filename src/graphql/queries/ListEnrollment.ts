import { gql } from "@apollo/client";

export const LIST_ENROLLMENT = gql`
  query ListEnrollment {
    listEnrollment {
      results {
        id
        class_id
        studentId
        student {
          name
          phone
          email
        }
      }
    }
  }
`;
