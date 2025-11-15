import { gql } from "@apollo/client";

export const UPDATE_SCORE = gql`
  mutation UpdateScores($id: ID!, $input: UpdateScoresInput!) {
    updateScores(id: $id, input: $input) {
      result {
        id
      }
    }
  }
`;
