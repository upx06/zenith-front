import { gql } from "@apollo/client";

export const LIST_TEACHERS = gql`
  query ListTeachers {
    listTeachers {
      results {
        email
        id
        name
        phone
      }
    }
  }
`;
