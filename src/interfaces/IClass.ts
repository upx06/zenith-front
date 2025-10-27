import type { IEnrollment } from "./IEnrollment";
import type { ILanguage } from "./ILanguage";
import type { ILesson } from "./ILesson";

export interface IClass {
  id: string;
  name: string;
  level: string;
  languageId: string;
  enrollments: IEnrollment[];
  language: ILanguage;
  lessons: ILesson[];
}
