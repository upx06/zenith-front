import { gql } from "@apollo/client";

export const CREATE_FREQUENCY = gql`
  mutation CreateFrequency($input: CreateFrequencyInput!) {
    createFrequency(input: $input) {
      result {
        id
        attendance
        enrollmentId
        lessonId
      }
    }
  }
`;
