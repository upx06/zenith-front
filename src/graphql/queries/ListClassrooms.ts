import { gql } from "@apollo/client";

export const LIST_CLASSROOMS = gql`
  query ListClassrooms {
    listClassroom {
      results {
        id
        name
        capacity
      }
    }
  }
`;
