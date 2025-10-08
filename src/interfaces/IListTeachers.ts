import type { ITeacher } from "./ITeacher";

export interface IListTeachers {
  listTeachers: {
    results: ITeacher[];
  };
}
