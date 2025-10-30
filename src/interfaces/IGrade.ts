import type { IEnrollment } from "./IEnrollment";
import type { ILanguage } from "./ILanguage";

export interface IGrade {
  id: string;
  score: number;
  comments?: string;
  enrollmentId: string;
  languageId: string;
  enrollment: IEnrollment;
  language: ILanguage;
}
