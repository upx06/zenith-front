import { gql } from "@apollo/client";

export const LIST_NO_CLASS_ENROLLMENT = gql`
  query ListNoClassEnrollment {
    listNoClassEnrollment {
      id
      student {
        email
        name
        phone
      }
    }
  }
`;
