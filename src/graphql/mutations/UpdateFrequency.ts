import { gql } from "@apollo/client";

export const UPDATE_FREQUENCY = gql`
  mutation UpdateFrequency($id: ID!, $input: UpdateFrequencyInput!) {
    updateFrequency(id: $id, input: $input) {
      result {
        id
        attendance
        enrollmentId
        lessonId
      }
    }
  }
`;
