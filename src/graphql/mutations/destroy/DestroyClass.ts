import { gql } from "@apollo/client";

export const DESTROY_CLASS = gql`
  mutation DestroyClass($id: ID!) {
    destroyClass(id: $id) {
      result {
        id
      }
    }
  }
`;
