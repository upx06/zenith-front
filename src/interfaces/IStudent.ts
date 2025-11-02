import type { IEnrollment } from "./IEnrollment";

export interface IStudent {
  id: string;
  name: string;
  email: string;
  phone: string;
  photoKey: string;
  goal?: string | null;
  enrollment: IEnrollment[];
}
