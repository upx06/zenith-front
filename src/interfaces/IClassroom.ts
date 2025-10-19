import type { ILesson } from "./ILesson";

export interface IClassroom {
  id: string;
  name: string;
  capacity: number;
  lesson: ILesson[];
}
