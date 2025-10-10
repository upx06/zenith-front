import { gql } from "@apollo/client";

export const LIST_CLASS_ENROLLMENTS = gql`
  query ListClassEnrollments {
    listClassEnrollments {
      id
      student {
        email
        name
        phone
      }
    }
  }
`;
