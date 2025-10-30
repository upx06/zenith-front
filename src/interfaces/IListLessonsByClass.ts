export interface ILessonByClass {
  id: string;
  classId: string;
  datetime: string;
  attendanceTaken: boolean;
}

export interface IListLessonsByClass {
  listLessons: {
    results: ILessonByClass[];
  };
}
