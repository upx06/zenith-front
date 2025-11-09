import { gql } from "@apollo/client";

export const UPDATE_LESSON = gql`
  mutation UpdateLesson($id: ID!, $input: UpdateLessonInput!) {
    updateLesson(id: $id, input: $input) {
      result {
        id
      }
    }
  }
`;
