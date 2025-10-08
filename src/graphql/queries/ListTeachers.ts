import { gql } from "@apollo/client";

export const LIST_TEACHERS = gql`
  query ListTeacher {
    listTeacher {
      results {
        email
        id
        name
        phone
      }
    }
  }
`;
