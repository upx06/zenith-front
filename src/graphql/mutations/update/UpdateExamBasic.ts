import { gql } from "@apollo/client";

export const UPDATE_EXAM_BASIC = gql`
  mutation UpdateExam($id: ID!, $input: UpdateExamInput!) {
    updateExam(id: $id, input: $input) {
      result {
        id
        name
        teacher {
          id
          name
        }
      }
    }
  }
`;
