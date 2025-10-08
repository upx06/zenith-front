import type { IStudent } from "./IStudent";

export interface IListStudents {
  listStudent: {
    results: IStudent[];
  };
}
