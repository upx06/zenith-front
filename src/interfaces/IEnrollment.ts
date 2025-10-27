import type { IClass } from "./IClass";
import type { IStudent } from "./IStudent";

export interface IEnrollment {
  id: string;
  studentId: string;
  classId: string;
  student: IStudent;
  class: IClass;
}
