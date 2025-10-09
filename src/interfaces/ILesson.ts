export interface ILesson {
  id: string;
  datetime: string;
  teacher: {
    id: string;
    name: string;
  };
  class: {
    id: string;
    name: string;
  };
  classroom: {
    id: string;
    name: string;
  };
}
