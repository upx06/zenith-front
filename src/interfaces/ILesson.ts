import type { IClass } from "./IClass";

export interface ILesson {
  id: string;
  datetime: string;
  teacher: {
    id: string;
    name: string;
    phone: string;
  };
  class: IClass;
  classroom: {
    id: string;
    name: string;
  };
}
