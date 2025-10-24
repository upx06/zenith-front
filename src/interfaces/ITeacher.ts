import type { ILesson } from "./ILesson";

export interface ITeacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  photoKey: string;
  lessons: ILesson[];
}
