import { gql } from "@apollo/client";

export const UPDATE_CLASSROOM = gql`
  mutation UpdateClassroom($id: ID!, $input: UpdateClassroomInput!) {
    updateClassroom(id: $id, input: $input) {
      result {
        id
      }
    }
  }
`;
