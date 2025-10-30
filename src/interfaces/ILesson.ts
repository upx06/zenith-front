import type { IClass } from "./IClass";

export interface ILesson {
  id: string;
  datetime: string;
  attendanceTaken: boolean;
  teacher: {
    id: string;
    name: string;
    phone: string;
    email: string;
  };
  class: IClass;
  classroom: {
    id: string;
    name: string;
    capacity: number;
  };
}
