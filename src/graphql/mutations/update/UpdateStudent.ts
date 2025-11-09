import { gql } from "@apollo/client";

export const UPDATE_STUDENT = gql`
  mutation UpdateStudent($id: ID!, $input: UpdateStudentInput!) {
    updateStudent(id: $id, input: $input) {
      result {
        id
      }
    }
  }
`;
