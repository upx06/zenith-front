import { gql } from "@apollo/client";

export const CREATE_LESSON = gql`
  mutation CreateLesson($input: CreateLessonInput!) {
    createLesson(input: $input) {
      result {
        id
      }
    }
  }
`;
