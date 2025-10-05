import type { IStudent } from "./IStudent";
import type { ITeacher } from "./ITeacher";

export interface IClass {
  id: string;
  name: string;
  level: string;
  description: string;
  student: IStudent[];
  teacher: ITeacher;
}
