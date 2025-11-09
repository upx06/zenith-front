import { gql } from "@apollo/client";

export const DESTROY_ENROLLMENT = gql`
  mutation DestroyEnrollment($id: ID!) {
    destroyEnrollment(id: $id) {
      result {
        id
      }
    }
  }
`;
