import type { IEnrollment } from "./IEnrollment";

export interface IClass {
  id: string;
  name: string;
  level: string;
  languageId: string;
  enrollments: IEnrollment[];
}
