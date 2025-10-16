import type { IClass } from "./IClass";

export interface ILesson {
  id: string;
  datetime: string;
  teacher: {
    id: string;
    name: string;
  };
  class: IClass;
  classroom: {
    id: string;
    name: string;
  };
}
