import type { IFrequency } from "./IFrequency";

export interface IListFrequencies {
  listFrequencies: {
    count: number;
    endKeyset: string;
    startKeyset: string;
    results: IFrequency[];
  };
}
