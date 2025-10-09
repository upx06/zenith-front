import { gql } from "@apollo/client";

export const LIST_CLASS_ENROLLMENT = gql`
  query ListClassEnrollment {
    listClassEnrollment {
      id
      student {
        email
        name
        phone
      }
    }
  }
`;
