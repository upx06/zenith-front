import type { IClassroom } from "./IClassroom";

export interface IListClassrooms {
  listClassrooms: {
    results: IClassroom[];
  };
}
