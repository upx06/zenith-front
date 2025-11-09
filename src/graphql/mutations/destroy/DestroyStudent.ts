import { gql } from "@apollo/client";

export const DESTROY_STUDENT = gql`
  mutation DestroyStudent($id: ID!) {
    destroyStudent(id: $id) {
      result {
        id
      }
    }
  }
`;
