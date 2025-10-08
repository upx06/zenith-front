import { gql } from "@apollo/client";

export const DESTROY_CLASSROOM = gql`
  mutation DestroyClassroom($id: ID!) {
    destroyClassroom(id: $id) {
      id
    }
  }
`;
