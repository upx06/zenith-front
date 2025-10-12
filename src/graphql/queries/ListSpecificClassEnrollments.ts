import { gql } from "@apollo/client";

export const LIST_SPECIFIC_ENROLLMENTS = gql`
  query ListSpecificEnrollments($classId: ID!) {
    listSpecificEnrollments(classId: $classId) {
      id
      studentId
      student {
        email
        name
        phone
      }
    }
  }
`;
