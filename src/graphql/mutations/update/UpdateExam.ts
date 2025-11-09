import { gql } from "@apollo/client";

export const UPDATE_EXAM = gql`
  mutation UpdateResults($id: ID!, $input: UpdateResultsInput!) {
    updateResults(id: $id, input: $input) {
      result {
        id
      }
    }
  }
`;
