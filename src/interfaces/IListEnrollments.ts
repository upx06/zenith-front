import type { IEnrollment } from "./IEnrollment";

export interface IListEnrollments {
  listEnrollments: {
    results: IEnrollment[];
  };
}
