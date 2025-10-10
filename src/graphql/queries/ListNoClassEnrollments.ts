import { gql } from "@apollo/client";

export const LIST_NO_CLASS_ENROLLMENTS = gql`
  query ListNoClassEnrollments {
    listNoClassEnrollments {
      id
      student {
        email
        name
        phone
      }
    }
  }
`;
