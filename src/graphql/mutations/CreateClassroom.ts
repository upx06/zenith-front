import { gql } from "@apollo/client";

export const CREATE_CLASSROOM = gql`
  mutation CreateClassroom($input: CreateClassroomInput!) {
    createClassroom(input: $input) {
      result {
        id
      }
    }
  }
`;
