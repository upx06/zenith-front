import type { IClass } from "./IClass";

export interface IEnrollment {
  id: string;
  studentId: string;
  classId: string;
  student: {
    name: string;
    phone: string;
    email: string;
  };
  class: IClass;
}
