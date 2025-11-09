import { gql } from "@apollo/client";

export const CREATE_EXAM = gql`
  mutation CreateExam($input: CreateExamInput!) {
    createExam(input: $input) {
      result {
        id
      }
    }
  }
`;
