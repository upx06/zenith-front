import type { IExam } from "./IExam";

export interface IListExams {
  listExams: {
    startKeyset: string;
    endKeyset: string;
    count: number;
    results: IExam[];
  };
}
