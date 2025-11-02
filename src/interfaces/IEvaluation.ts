import type { ITeacher } from "./ITeacher";
import type { IClass } from "./IClass";
import type { IStudent } from "./IStudent";

export interface IEvaluationTopic {
  id: string;
  name: string;
  description?: string;
}

export interface IEvaluation {
  id: string;
  name: string;
  date: string;
  teacherId: string;
  classId?: string | null;
  studentId?: string | null;
  topics: IEvaluationTopic[];
  teacher: ITeacher;
  class?: IClass | null;
  student?: IStudent | null;
}
