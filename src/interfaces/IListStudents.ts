import type { IStudent } from "./IStudent";

export interface IListStudents {
  listStudents: {
    startKeyset: string;
    endKeyset: string;
    count: number;
    results: IStudent[];
  };
}
