import type { IEvaluation } from "./IEvaluation";

export interface IListEvaluations {
  listEvaluations: {
    count: number;
    endKeyset: string;
    startKeyset: string;
    results: IEvaluation[];
  };
}
