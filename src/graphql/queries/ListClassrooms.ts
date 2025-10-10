import { gql } from "@apollo/client";

export const LIST_CLASSROOMS = gql`
  query ListClassrooms {
    listClassrooms {
      results {
        id
        name
        capacity
      }
    }
  }
`;
