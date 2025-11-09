import { gql } from "@apollo/client";

export const DESTROY_TEACHER = gql`
  mutation DestroyTeacher($id: ID!) {
    destroyTeacher(id: $id) {
      result {
        id
      }
    }
  }
`;
