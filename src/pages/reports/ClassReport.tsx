import { useState, useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import { Menu } from "../../components/Menu";
import { LIST_CLASSES } from "../../graphql/queries/ListClasses";
import { LIST_SPECIFIC_ENROLLMENTS } from "../../graphql/queries/ListSpecificClassEnrollments";
import { LIST_LESSONS_BY_CLASS } from "../../graphql/queries/ListLessonsByClass";
import { LIST_FREQUENCIES_BY_CLASS } from "../../graphql/queries/ListFrequenciesByClass";
import type { IListClasses } from "../../interfaces/IListClasses";
import type { IListClassEnrollments } from "../../interfaces/IClassEnrollment";
import type { IListLessonsByClass } from "../../interfaces/IListLessonsByClass";
import type { IListFrequenciesByClass } from "../../interfaces/IListFrequenciesByClass";
import type { IStudentReport } from "../../interfaces/IStudentReport";
import { Users, BookOpen, CheckCircle, XCircle, Loader2 } from "lucide-react";

export const ClassReport = () => {
  const [selectedClassId, setSelectedClassId] = useState<string>("");

  const { data: classesData, loading: classesLoading } = useQuery<IListClasses>(
    LIST_CLASSES,
    {
      fetchPolicy: "network-only",
    }
  );

  const classes = classesData?.listClasses?.results || [];

  useMemo(() => {
    if (classes.length > 0 && !selectedClassId) {
      const classesWithStudents = classes.filter(
        (c) => c.enrollments && c.enrollments.length > 0
      );
      if (classesWithStudents.length > 0) {
        setSelectedClassId(classesWithStudents[0].id);
      }
    }
  }, [classes, selectedClassId]);

  const { data: enrollmentsData, loading: enrollmentsLoading } =
    useQuery<IListClassEnrollments>(LIST_SPECIFIC_ENROLLMENTS, {
      variables: { classId: selectedClassId },
      skip: !selectedClassId,
      fetchPolicy: "network-only",
    });

  const { data: lessonsData, loading: lessonsLoading } =
    useQuery<IListLessonsByClass>(LIST_LESSONS_BY_CLASS, {
      variables: { classId: selectedClassId },
      skip: !selectedClassId,
      fetchPolicy: "network-only",
    });

  const { data: frequenciesData, loading: frequenciesLoading } =
    useQuery<IListFrequenciesByClass>(LIST_FREQUENCIES_BY_CLASS, {
      variables: { classId: selectedClassId },
      skip: !selectedClassId,
      fetchPolicy: "network-only",
    });

  const enrollments = enrollmentsData?.listSpecificEnrollments || [];
  const lessons = lessonsData?.listLessons?.results || [];
  const frequencies = frequenciesData?.listFrequencies?.results || [];

  const studentsReport = useMemo<IStudentReport[]>(() => {
    if (!enrollments.length || !lessons.length) return [];

    const lessonsWithAttendance = lessons.filter(
      (lesson) => lesson.attendanceTaken === true
    );

    return enrollments.map((enrollment) => {
      const studentFrequencies = frequencies.filter(
        (freq) => freq.enrollmentId === enrollment.id
      );

      const presences = studentFrequencies.filter((f) => f.attendance).length;
      const absences = studentFrequencies.filter((f) => !f.attendance).length;

      return {
        studentId: enrollment.student.id,
        studentName: enrollment.student.name,
        totalLessons: lessonsWithAttendance.length,
        presences,
        absences,
      };
    });
  }, [enrollments, lessons, frequencies]);

  const loading =
    classesLoading ||
    enrollmentsLoading ||
    lessonsLoading ||
    frequenciesLoading;

  const selectedClass = classes.find((c) => c.id === selectedClassId);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Menu />
      <div
        className="hidden lg:block lg:w-64 xl:w-72 shrink-0"
        aria-hidden="true"
      />
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 p-4 md:p-6 lg:p-8 mt-16 lg:mt-0">
          <div className="space-y-4 md:space-y-6">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-800 uppercase">
                Relatório dos Alunos
              </h1>
              <p className="text-slate-600 text-sm md:text-base">
                Visualize presenças e faltas de cada aluno
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-slate-800">
                  Selecione a Turma
                </h2>
              </div>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                disabled={classesLoading}
                className="w-full max-w-md px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Selecione uma turma</option>
                {classes
                  .filter((c) => c.enrollments && c.enrollments.length > 0)
                  .map((classItem) => (
                    <option key={classItem.id} value={classItem.id}>
                      {classItem.name} - {classItem.level} (
                      {classItem.enrollments?.length || 0} aluno
                      {classItem.enrollments?.length === 1 ? "" : "s"})
                    </option>
                  ))}
              </select>
            </div>

            {loading && selectedClassId && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      Carregando dados...
                    </h3>
                    <p className="text-sm text-slate-600">
                      Buscando informações da turma
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!loading && selectedClassId && selectedClass && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 md:px-6 py-3 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-semibold text-slate-700">
                        {selectedClass.name} - {selectedClass.level}
                      </span>
                    </div>
                    <span className="text-xs text-slate-600">
                      {studentsReport.length} aluno
                      {studentsReport.length === 1 ? "" : "s"}
                    </span>
                  </div>
                </div>

                {studentsReport.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-slate-600">
                      Nenhum aluno encontrado nesta turma
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            Aluno
                          </th>
                          <th className="px-4 md:px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            <div className="flex items-center justify-center gap-1">
                              <BookOpen className="w-4 h-4" />
                              <span>Total de Aulas</span>
                            </div>
                          </th>
                          <th className="px-4 md:px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            <div className="flex items-center justify-center gap-1">
                              <CheckCircle className="w-4 h-4" />
                              <span>Presenças</span>
                            </div>
                          </th>
                          <th className="px-4 md:px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            <div className="flex items-center justify-center gap-1">
                              <XCircle className="w-4 h-4" />
                              <span>Faltas</span>
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {studentsReport.map((student) => (
                          <tr
                            key={student.studentId}
                            className="hover:bg-slate-50 transition-colors"
                          >
                            <td className="px-4 md:px-6 py-4">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                  <span className="text-sm font-semibold text-blue-600">
                                    {student.studentName
                                      .charAt(0)
                                      .toUpperCase()}
                                  </span>
                                </div>
                                <span className="text-sm font-medium text-slate-900">
                                  {student.studentName}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 md:px-6 py-4 text-center">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                                {student.totalLessons}
                              </span>
                            </td>
                            <td className="px-4 md:px-6 py-4 text-center">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                {student.presences}
                              </span>
                            </td>
                            <td className="px-4 md:px-6 py-4 text-center">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                                {student.absences}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {!loading && !selectedClassId && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                    <Users className="h-8 w-8 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      Selecione uma turma
                    </h3>
                    <p className="text-sm text-slate-600">
                      Escolha uma turma para visualizar o relatório de alunos
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
