import { gql } from "@apollo/client";

export const LIST_STUDENTS = gql`
  query ListStudent {
    listStudent {
      results {
        email
        id
        name
        phone
      }
    }
  }
`;
