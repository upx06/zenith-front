import { gql } from "@apollo/client";

export const LIST_STUDENT_NOT_ENROLLED_IN_CLASS = gql`
  query StudentsNotEnrolledInClass($classId: ID!) {
    studentsNotEnrolledInClass(classId: $classId) {
      email
      id
      name
      phone
    }
  }
`;
