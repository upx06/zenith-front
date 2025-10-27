import type { IClass } from "./IClass";

export interface IListClasses {
  listClasses: {
    startKeyset: string;
    endKeyset: string;
    count: number;
    results: IClass[];
  };
}
