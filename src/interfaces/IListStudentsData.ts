import type { IStudent } from "./IStudent";

export interface IListStudentsData {
  listStudents: {
    results: IStudent[];
  };
}
