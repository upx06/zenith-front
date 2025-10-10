import type { IStudent } from "./IStudent";

export interface IListStudents {
  listStudents: {
    results: IStudent[];
  };
}
