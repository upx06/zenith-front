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

  // REMOVER este useMemo que seleciona automaticamente a primeira turma
  // useMemo(() => {
  //   if (classes.length > 0 && !selectedClassId) {
  //     const classesWithStudents = classes.filter(
  //       (c) => c.enrollments && c.enrollments.length > 0
  //     );
  //     if (classesWithStudents.length > 0) {
  //       setSelectedClassId(classesWithStudents[0].id);
  //     }
  //   }
  // }, [classes, selectedClassId]);

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
            <div className="flex flex-row justify-between gap-4 pt-5 md:pt-0">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-800 uppercase">
                  Relatório dos Alunos
                </h1>
                <p className="text-slate-600 text-sm md:text-base">
                  Visualize presenças e faltas de cada aluno
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-2 text-slate-700 min-w-fit">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium">Turma:</span>
                </div>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  disabled={classesLoading}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
              <div className="relative">
                <div className="md:bg-white md:rounded-xl md:border md:border-slate-200 md:shadow-md md:overflow-hidden">
                  {/* Header da turma */}
                  <div className="hidden md:block bg-slate-100 px-4 md:px-6 py-3 border-b border-slate-200">
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
                    <>
                      {/* Header da tabela - Desktop */}
                      <div className="hidden md:grid md:grid-cols-12 gap-4 bg-slate-50 px-6 py-4 text-sm font-semibold text-slate-700 uppercase tracking-wide">
                        <div className="col-span-5">Aluno</div>
                        <div className="col-span-2 text-center">
                          Total de Aulas
                        </div>
                        <div className="col-span-2 text-center">Presenças</div>
                        <div className="col-span-3 text-center">Faltas</div>
                      </div>

                      {/* Linhas da tabela */}
                      <div className="flex flex-col gap-3 md:gap-0 md:divide-y md:divide-slate-100">
                        {studentsReport.map((student) => (
                          <div
                            key={student.studentId}
                            className="hover:bg-blue-50/40 transition-all duration-200 group"
                          >
                            {/* Layout Mobile */}
                            <div className="md:hidden px-4 py-4 space-y-3 rounded-lg border border-slate-200 shadow-sm">
                              {/* Header do Card */}
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                                  <span className="text-base font-bold text-white">
                                    {student.studentName
                                      .charAt(0)
                                      .toUpperCase()}
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-semibold text-slate-800 text-sm">
                                    {student.studentName}
                                  </h3>
                                </div>
                              </div>

                              {/* Métricas */}
                              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                                <div className="flex flex-col items-center p-2 bg-slate-50 rounded-lg">
                                  <BookOpen className="w-4 h-4 text-slate-400 mb-1" />
                                  <span className="text-xs text-slate-500 mb-1">
                                    Aulas
                                  </span>
                                  <span className="text-sm font-bold text-slate-700">
                                    {student.totalLessons}
                                  </span>
                                </div>
                                <div className="flex flex-col items-center p-2 bg-blue-50 rounded-lg">
                                  <CheckCircle className="w-4 h-4 text-blue-500 mb-1" />
                                  <span className="text-xs text-blue-600 mb-1">
                                    Presenças
                                  </span>
                                  <span className="text-sm font-bold text-blue-700">
                                    {student.presences}
                                  </span>
                                </div>
                                <div className="flex flex-col items-center p-2 bg-red-50 rounded-lg">
                                  <XCircle className="w-4 h-4 text-red-500 mb-1" />
                                  <span className="text-xs text-red-600 mb-1">
                                    Faltas
                                  </span>
                                  <span className="text-sm font-bold text-red-700">
                                    {student.absences}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Layout Desktop */}
                            <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-5">
                              {/* Nome do Aluno */}
                              <div className="col-span-5 flex items-center">
                                <h3 className="font-semibold text-slate-800 text-base group-hover:text-blue-700 transition-colors">
                                  {student.studentName}
                                </h3>
                              </div>

                              {/* Total de Aulas */}
                              <div className="col-span-2 flex items-center justify-center">
                                <div className="flex items-center gap-2">
                                  <BookOpen className="w-4 h-4 text-slate-400" />
                                  <span className="text-sm font-medium text-slate-700">
                                    {student.totalLessons}
                                  </span>
                                </div>
                              </div>

                              {/* Presenças */}
                              <div className="col-span-2 flex items-center justify-center">
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                  <span className="text-sm font-medium text-slate-700">
                                    {student.presences}
                                  </span>
                                </div>
                              </div>

                              {/* Faltas */}
                              <div className="col-span-3 flex items-center justify-center">
                                <div className="flex items-center gap-2">
                                  <XCircle className="w-4 h-4 text-red-500" />
                                  <span className="text-sm font-medium text-slate-700">
                                    {student.absences}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
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
