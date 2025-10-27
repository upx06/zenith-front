import type { ITeacher } from "./ITeacher";

export interface IListTeachers {
  listTeachers: {
    startKeyset: string;
    endKeyset: string;
    count: number;
    results: ITeacher[];
  };
}
