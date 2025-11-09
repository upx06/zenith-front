import type { IClass } from "./IClass";
import type { IEnrollment } from "./IEnrollment";
import type { ITeacher } from "./ITeacher";
import type { ITopic } from "./ITopic";

export interface IExamScore {
  id: string;
  resultId: string;
  topicId: string;
  score: number;
  feedback: string;
  topic: ITopic;
}

export interface IExamResult {
  id: string;
  totalScore: number;
  enrollmentId: string;
  scores: IExamScore[];
}

export interface IExam {
  id: string;
  name: string;
  enrollment: IEnrollment;
  teacher: ITeacher;
  class: IClass;
  topics: ITopic[];
  results: IExamResult[];
}
