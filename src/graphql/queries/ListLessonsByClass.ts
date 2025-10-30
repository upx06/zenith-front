import { gql } from "@apollo/client";

export const LIST_LESSONS_BY_CLASS = gql`
  query ListLessonsByClass($classId: ID!) {
    listLessons(filter: { classId: { eq: $classId } }) {
      count
      endKeyset
      startKeyset
      results {
        id
        classId
        datetime
        attendanceTaken
        teacherId
        classroomId
      }
    }
  }
`;
