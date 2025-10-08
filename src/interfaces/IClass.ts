import type { IStudent } from "./IStudent";
import type { ITeacher } from "./ITeacher";

export interface IClass {
  id: string;
  name: string;
  level: string;
  description: string;
  languageId: string;
  student: IStudent[];
  teacher: ITeacher;
}
