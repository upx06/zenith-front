export interface IClassEnrollment {
  id: string;
  studentId: string;
  student: {
    id: string;
    name: string;
    email: string;
  };
}

export interface IListClassEnrollments {
  listSpecificEnrollments: IClassEnrollment[];
}
