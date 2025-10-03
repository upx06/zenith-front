import type { ITeacher } from "./ITeacher";

export interface IListTeachersData {
  listTeachers: {
    results: ITeacher[];
  };
}
