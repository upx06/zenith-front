import {
  X,
  Calendar,
  Clock,
  User,
  BookOpen,
  MapPin,
  Users,
  Languages,
  Star,
  Mail,
  Phone,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { ILesson } from "../../interfaces/ILesson";

interface IDetailsSchedulingModalProps {
  lesson: ILesson;
  closeDetailsSchedulingModal: () => void;
}

export const DetailsSchedulingModal = ({
  lesson,
  closeDetailsSchedulingModal,
}: IDetailsSchedulingModalProps) => {
  const formatDateTime = (datetime: string) => {
    const date = parseISO(datetime);
    return {
      date: format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }),
      time: format(date, "HH:mm", { locale: ptBR }),
      dayOfWeek: format(date, "EEEE", { locale: ptBR }),
      fullDate: format(date, "dd/MM/yyyy", { locale: ptBR }),
    };
  };

  const { date, time, dayOfWeek } = formatDateTime(lesson.datetime);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Calendar className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Detalhes da Aula</h2>
                <p className="text-blue-100 mt-1">{lesson.class.name}</p>
              </div>
            </div>
            <button
              onClick={closeDetailsSchedulingModal}
              className="text-white/80 hover:text-white transition-colors p-1"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Data e Hora */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Data e Horário
            </h3>
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="w-20 h-20 bg-blue-50 rounded-lg flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-xs text-blue-600 font-medium uppercase">
                    {format(parseISO(lesson.datetime), "MMM", {
                      locale: ptBR,
                    })}
                  </span>
                  <span className="text-2xl font-bold text-blue-700">
                    {format(parseISO(lesson.datetime), "dd")}
                  </span>
                </div>

                <div className="flex-1">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <div>
                        <span className="text-sm text-slate-500 block">
                          Data
                        </span>
                        <span className="font-medium text-slate-800">
                          {date}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <div>
                        <span className="text-sm text-slate-500 block">
                          Horário
                        </span>
                        <span className="font-medium text-slate-800">
                          {time} • {dayOfWeek}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Informações da Turma */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              Informações da Turma
            </h3>
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-3">
              <div className="flex items-center gap-3 text-slate-700">
                <BookOpen className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div>
                  <span className="text-sm text-slate-500 block">Turma</span>
                  <span className="font-medium">{lesson.class.name}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-700">
                <Star className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div>
                  <span className="text-sm text-slate-500 block">Nível</span>
                  <span className="font-medium">{lesson.class.level}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-700">
                <Languages className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div>
                  <span className="text-sm text-slate-500 block">
                    Linguagem
                  </span>
                  <span className="font-medium">
                    {lesson.class.language.name}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Professor */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Professor
            </h3>
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-3">
              <div className="flex items-center gap-3 text-slate-700">
                <User className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div>
                  <span className="text-sm text-slate-500 block">Nome</span>
                  <span className="font-medium">{lesson.teacher.name}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-700">
                <Mail className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div>
                  <span className="text-sm text-slate-500 block">E-mail</span>
                  <span className="font-medium break-all">
                    {lesson.teacher.email}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-700">
                <Phone className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div>
                  <span className="text-sm text-slate-500 block">Telefone</span>
                  <span className="font-medium">{lesson.teacher.phone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sala */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Local da Aula
            </h3>
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-3">
              <div className="flex items-center gap-3 text-slate-700">
                <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div>
                  <span className="text-sm text-slate-500 block">Sala</span>
                  <span className="font-medium">{lesson.classroom.name}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-700">
                <Users className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div>
                  <span className="text-sm text-slate-500 block">
                    Capacidade
                  </span>
                  <span className="font-medium">
                    {lesson.classroom.capacity}{" "}
                    {lesson.classroom.capacity === 1 ? "aluno" : "alunos"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 p-4 bg-slate-50">
          <button
            onClick={closeDetailsSchedulingModal}
            className="w-full md:w-auto px-6 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
