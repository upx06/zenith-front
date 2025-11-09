import { gql } from "@apollo/client";

export const UPDATE_CLASS = gql`
  mutation updateClass($id: ID!, $input: UpdateClassInput!) {
    updateClass(id: $id, input: $input) {
      result {
        id
      }
    }
  }
`;
