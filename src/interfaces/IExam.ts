import type { IClass } from "./IClass";
import type { IEnrollment } from "./IEnrollment";
import type { ITeacher } from "./ITeacher";
import type { ITopic } from "./ITopic";

export interface IExam {
  id: string;
  name: string;
  enrollment: IEnrollment;
  teacher: ITeacher;
  class: IClass;
  topics: ITopic[];
}
