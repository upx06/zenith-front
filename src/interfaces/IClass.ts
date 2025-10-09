import type { IEnrollment } from "./IEnrollment";
import type { ILanguage } from "./ILanguage";

export interface IClass {
  id: string;
  name: string;
  level: string;
  languageId: string;
  enrollments: IEnrollment[];
  language: ILanguage;
}
