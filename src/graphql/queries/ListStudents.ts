import { gql } from "@apollo/client";

export const LIST_STUDENTS = gql`
  query ListStudents {
    listStudents {
      results {
        email
        id
        name
        phone
      }
    }
  }
`;
