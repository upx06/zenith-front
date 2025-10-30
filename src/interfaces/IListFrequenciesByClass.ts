export interface IFrequencyByClass {
  id: string;
  attendance: boolean;
  enrollmentId: string;
  lessonId: string;
  enrollment: {
    id: string;
    studentId: string;
    student: {
      id: string;
      name: string;
    };
  };
  lesson: {
    id: string;
    datetime: string;
    classId: string;
  };
}

export interface IListFrequenciesByClass {
  listFrequencies: {
    results: IFrequencyByClass[];
  };
}
