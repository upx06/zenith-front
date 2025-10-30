import type { IEnrollment } from "./IEnrollment";
import type { ILesson } from "./ILesson";

export interface IFrequency {
  id: string;
  attendance: boolean;
  enrollmentId: string;
  lessonId: string;
  enrollment: IEnrollment;
  lesson: ILesson;
}
