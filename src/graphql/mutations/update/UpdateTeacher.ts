import { gql } from "@apollo/client";

export const UPDATE_TEACHER = gql`
  mutation UpdateTeacher($id: ID!, $input: UpdateTeacherInput!) {
    updateTeacher(id: $id, input: $input) {
      result {
        id
      }
    }
  }
`;
