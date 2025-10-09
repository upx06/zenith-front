import { gql } from "@apollo/client";

export const DESTROY_LESSON = gql`
  mutation DestroyLesson($id: ID!) {
    destroyLesson(id: $id) {
      result {
        id
      }
    }
  }
`;
