import {
  X,
  GraduationCap,
  Mail,
  Phone,
  Calendar,
  Clock,
  BookOpen,
  MapPin,
} from "lucide-react";
import { format, isFuture, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { ITeacher } from "../../interfaces/ITeacher";

interface ITeacherDetailsModal {
  teacher: ITeacher;
  photo: string | null;
  closeTeacherDetailsModal: () => void;
}

export const TeacherDetailsModal = ({
  teacher,
  photo,
  closeTeacherDetailsModal,
}: ITeacherDetailsModal) => {
  // Filtra apenas as aulas futuras
  const futureLessons =
    teacher.lessons
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {photo ? (
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/20 shrink-0">
                  <img
                    src={photo}
                    alt={`Foto de ${teacher.name}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                  <GraduationCap className="w-7 h-7" />
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold">{teacher.name}</h2>
                <p className="text-blue-100 mt-1">Detalhes do professor</p>
              </div>
            </div>
            <button
              onClick={closeTeacherDetailsModal}
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
            <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              Informações do Professor
            </h3>
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-3">
              <div className="flex items-center gap-3 text-slate-700">
                <Mail className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <span className="text-sm text-slate-500 block">E-mail</span>
                  <span className="font-medium break-all">{teacher.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-700">
                <Phone className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <span className="text-sm text-slate-500 block">Telefone</span>
                  <span className="font-medium">{teacher.phone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Aulas Futuras */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Próximas Aulas
              <span className="text-sm font-normal text-slate-500 ml-1">
                ({futureLessons.length})
              </span>
            </h3>

            {futureLessons.length === 0 ? (
              <div className="bg-slate-50 rounded-lg p-8 text-center border border-slate-200">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 font-medium">
                  Nenhuma aula agendada
                </p>
                <p className="text-slate-500 text-sm mt-1">
                  Não há aulas futuras cadastradas para este professor
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {futureLessons.map((lesson) => {
                  const { time, dayOfWeek } = formatDateTime(lesson.datetime);
                  return (
                    <div
                      key={lesson.id}
                      className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md hover:border-blue-200 transition-all"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        {/* Data e Hora */}
                        <div className="flex items-start gap-3">
                          <div className="w-16 h-16 bg-blue-50 rounded-lg flex flex-col items-center justify-center shrink-0">
                            <span className="text-xs text-blue-600 font-medium uppercase">
                              {format(parseISO(lesson.datetime), "MMM", {
                                locale: ptBR,
                              })}
                            </span>
                            <span className="text-xl font-bold text-blue-700">
                              {format(parseISO(lesson.datetime), "dd")}
                            </span>
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Clock className="w-4 h-4 text-slate-400" />
                              <span className="font-semibold text-slate-800">
                                {time}
                              </span>
                              <span className="text-slate-500 text-sm">
                                • {dayOfWeek}
                              </span>
                            </div>

                            {/* Turma */}
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <BookOpen className="w-4 h-4 text-slate-400" />
                              <span className="font-medium">
                                {lesson.class.name}
                              </span>
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-medium">
                                {lesson.class.level}
                              </span>
                            </div>

                            {/* Sala - SE DISPONÍVEL */}
                            {lesson.classroom && (
                              <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                                <MapPin className="w-4 h-4 text-slate-400" />
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

        {/* Footer */}
        <div className="border-t border-slate-200 p-4 bg-slate-50">
          <button
            onClick={closeTeacherDetailsModal}
            className="w-full md:w-auto px-6 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
