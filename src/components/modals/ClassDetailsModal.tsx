import {
  X,
  GraduationCap,
  Users,
  Calendar,
  Clock,
  BookOpen,
  MapPin,
  Languages,
  Star,
} from "lucide-react";
import { format, isFuture, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { IClass } from "../../interfaces/IClass";

interface IClassDetailsModal {
  clas: IClass;
  closeClassDetailsModal: () => void;
}

export const ClassDetailsModal = ({
  clas,
  closeClassDetailsModal,
}: IClassDetailsModal) => {
  // Filtra apenas as aulas futuras
  const futureLessons =
    clas.lessons
      ?.filter((lesson) => isFuture(parseISO(lesson.datetime)))
      .sort(
        (a, b) =>
          new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
      ) || [];

  const formatDateTime = (datetime: string) => {
    const date = parseISO(datetime);
    return {
      date: format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }),
      time: format(date, "HH:mm", { locale: ptBR }),
      dayOfWeek: format(date, "EEEE", { locale: ptBR }),
    };
  };

  const totalStudents = clas.enrollments?.length || 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 dark:bg-blue-500 p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                <GraduationCap className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{clas.name}</h2>
                <p className="text-blue-100 mt-1">Detalhes da turma</p>
              </div>
            </div>
            <button
              onClick={closeClassDetailsModal}
              className="text-white/80 hover:text-white transition-colors p-1"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Informações Básicas */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Informações da Turma
            </h3>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
                <Star className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                <div>
                  <span className="text-sm text-slate-500 dark:text-slate-400 block">Nível</span>
                  <span className="font-medium">{clas.level}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
                <Languages className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                <div>
                  <span className="text-sm text-slate-500 dark:text-slate-400 block">
                    Linguagem
                  </span>
                  <span className="font-medium">{clas.language?.name}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                <div>
                  <span className="text-sm text-slate-500 dark:text-slate-400 block">
                    Alunos Matriculados
                  </span>
                  <span className="font-medium">
                    {totalStudents} {totalStudents === 1 ? "aluno" : "alunos"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de Alunos */}
          {/* {totalStudents > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Alunos Matriculados
                <span className="text-sm font-normal text-slate-500 ml-1">
                  ({totalStudents})
                </span>
              </h3>
              <div className="bg-slate-50 rounded-lg border border-slate-200">
                {clas.enrollments?.map((enrollment, index) => (
                  <div
                    key={enrollment.student.id}
                    className={`p-3 flex items-center gap-3 ${
                      index !== clas.enrollments.length - 1
                        ? "border-b border-slate-200"
                        : ""
                    }`}
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="font-medium text-slate-800">
                      {enrollment.student.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )} */}

          {/* Aulas Futuras */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Próximas Aulas
              <span className="text-sm font-normal text-slate-500 dark:text-slate-400 ml-1">
                ({futureLessons.length})
              </span>
            </h3>

            {futureLessons.length === 0 ? (
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-8 text-center border border-slate-200 dark:border-slate-700">
                <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-slate-600 dark:text-slate-300 font-medium">
                  Nenhuma aula agendada
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                  Não há aulas futuras cadastradas para esta turma
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {futureLessons.map((lesson) => {
                  const { time, dayOfWeek } = formatDateTime(lesson.datetime);
                  return (
                    <div
                      key={lesson.id}
                      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-400 transition-all"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        {/* Data e Hora */}
                        <div className="flex items-start gap-3">
                          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex flex-col items-center justify-center shrink-0">
                            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase">
                              {format(parseISO(lesson.datetime), "MMM", {
                                locale: ptBR,
                              })}
                            </span>
                            <span className="text-xl font-bold text-blue-700 dark:text-blue-300">
                              {format(parseISO(lesson.datetime), "dd")}
                            </span>
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Clock className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                              <span className="font-semibold text-slate-800 dark:text-white">
                                {time}
                              </span>
                              <span className="text-slate-500 dark:text-slate-400 text-sm">
                                • {dayOfWeek}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                              <BookOpen className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                              <span className="font-medium">
                                {lesson.class.name}
                              </span>
                              <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded text-xs font-medium">
                                {lesson.class.level}
                              </span>
                            </div>

                            {lesson.classroom && (
                              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 mt-1">
                                <MapPin className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                                <span>{lesson.classroom.name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
