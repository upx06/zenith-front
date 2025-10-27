import type { IClassroom } from "./IClassroom";

export interface IListClassrooms {
  listClassrooms: {
    startKeyset: string;
    endKeyset: string;
    count: number;
    results: IClassroom[];
  };
}
