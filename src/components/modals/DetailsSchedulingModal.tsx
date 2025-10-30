import { useState } from "react";
import {
  X,
  Calendar,
  User,
  Users,
  Trash2,
  Edit,
  MapPin,
  Mail,
  Phone,
} from "lucide-react";
import { ConfirmationModal } from "./ConfirmationModal";
import { ClassroomLayout } from "../ClassroomLayout";
import type { IClass } from "../../interfaces/IClass";
import { formatDateTimeForDisplay } from "../../utils/date";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useMutation } from "@apollo/client/react";
import { DESTROY_LESSON } from "../../graphql/mutations/DestroyLesson";
import toast from "react-hot-toast";

interface DetailsSchedulingModalProps {
  onClose: () => void;
  onEdit?: () => void;
  scheduling: {
    id: string;
    subject: string;
    teacher: string;
    class: string;
    datetime: string;
  };
  classData?: IClass;
  teacherData?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  classroomData?: {
    id: string;
    name: string;
    capacity: number;
  };
  roomName: string;
  timeSlot: string;
  date: string;
  isLoading?: boolean;
  refetchScheduling: () => void;
}

export const DetailsSchedulingModal = ({
  onClose,
  onEdit,
  scheduling,
  classData,
  teacherData,
  classroomData,
  roomName,
  timeSlot,
  date,
  isLoading = false,
  refetchScheduling,
}: DetailsSchedulingModalProps) => {
  const [showConfirmation, setShowConfirmation] = useState(false);

  const [
    deleteLesson,
    { loading: loadingDeleteLesson, error: errorDeleteLesson },
  ] = useMutation(DESTROY_LESSON);

  const handleDeleteClick = () => {
    setShowConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteLesson({
        variables: {
          id: scheduling.id,
        },
      });

      toast.success("Aula excluída com sucesso!");
      refetchScheduling();
      setShowConfirmation(false);
      onClose();
    } catch (error: any) {
      console.error("Erro ao excluir agendamento:", error);
      toast.error(error?.message || "Erro ao excluir aula");
    }
  };

  const handleCloseConfirmation = () => {
    if (!loadingDeleteLesson) {
      setShowConfirmation(false);
    }
  };

  const isProcessing = isLoading || loadingDeleteLesson;

  const parsedDate = parseISO(scheduling.datetime);
  const dayOfWeek = format(parsedDate, "EEEE", { locale: ptBR });
  const formattedDate = format(parsedDate, "dd/MM/yyyy", { locale: ptBR });

  const students = classData?.enrollments?.map((e) => e.student) || [];
  const teacher = teacherData || {
    id: "unknown",
    name: scheduling.teacher,
  };
  const capacity = classroomData?.capacity || 20;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-linear-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">
                  {scheduling.subject}
                </h2>
                <p className="text-blue-100 text-sm">
                  {date} • {timeSlot} • Sala {roomName}
                </p>
              </div>
              <button
                onClick={onClose}
                disabled={isProcessing}
                className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-5 max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-semibold text-slate-700 uppercase">
                      Local
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-lg font-bold text-slate-900">
                      {roomName}
                    </div>
                    {classroomData && (
                      <div className="text-sm text-slate-600">
                        Capacidade: {classroomData.capacity} lugares
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-semibold text-slate-700 uppercase">
                      Data e Hora
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-slate-500 capitalize">
                      {dayOfWeek}
                    </div>
                    <div className="text-base font-bold text-slate-900">
                      {formattedDate} - {timeSlot}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <User className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-semibold text-slate-700 uppercase">
                      Professor
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-slate-900">
                      {scheduling.teacher}
                    </div>
                    {teacherData?.email && (
                      <div className="text-xs text-slate-600 flex items-center gap-1 truncate">
                        <Mail className="h-3 w-3 shrink-0" />
                        <span className="truncate">{teacherData.email}</span>
                      </div>
                    )}
                    {teacherData?.phone && (
                      <div className="text-xs text-slate-600 flex items-center gap-1">
                        <Phone className="h-3 w-3 shrink-0" />
                        {teacherData.phone}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-4 w-4 text-blue-600" />
                  <h3 className="text-sm font-semibold text-slate-900">
                    Informações da Turma
                  </h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="text-center">
                    <div className="text-xs text-slate-500 mb-1">Turma</div>
                    <div className="text-base font-bold text-slate-900">
                      {scheduling.class}
                    </div>
                  </div>
                  {classData && (
                    <>
                      <div className="text-center">
                        <div className="text-xs text-slate-500 mb-1">
                          Idioma
                        </div>
                        <div className="text-base font-bold text-slate-900">
                          {classData.language?.name}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-slate-500 mb-1">Nível</div>
                        <div className="text-base font-bold text-slate-900">
                          {classData.level}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-slate-500 mb-1">
                          Alunos
                        </div>
                        <div className="text-base font-bold text-slate-900">
                          {students.length}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">
                  Visualização da Sala de Aula
                </h3>
                <ClassroomLayout
                  teacher={teacher}
                  students={students}
                  capacity={capacity}
                />
              </div>

              {/* Mensagem de erro da exclusão */}
              {errorDeleteLesson && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-800 mb-1">
                    <span className="font-medium text-sm">
                      Erro ao excluir agendamento
                    </span>
                  </div>
                  <p className="text-red-700 text-sm">
                    {errorDeleteLesson.message}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer - Botões de Ação */}
          <div className="border-t border-slate-200 p-4 bg-slate-50">
            <div className="flex flex-col sm:flex-row gap-3 justify-between">
              <div className="flex gap-2">
                {onEdit && (
                  <button
                    onClick={onEdit}
                    disabled={isProcessing}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Editar</span>
                  </button>
                )}
                <button
                  onClick={onClose}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Fechar
                </button>
              </div>
              <button
                onClick={handleDeleteClick}
                disabled={isProcessing}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingDeleteLesson ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Excluindo...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    <span>Excluir</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Confirmação */}
      {showConfirmation && (
        <ConfirmationModal
          onClose={handleCloseConfirmation}
          onConfirm={handleConfirmDelete}
          title="Excluir Agendamento"
          message={`Tem certeza que deseja excluir o agendamento da turma ${
            scheduling.class
          } às ${formatDateTimeForDisplay(scheduling.datetime)} com ${
            scheduling.teacher
          }?`}
          confirmText={loadingDeleteLesson ? "Excluindo..." : "Excluir"}
          cancelText="Cancelar"
          isLoading={loadingDeleteLesson}
          isDisabled={loadingDeleteLesson}
        />
      )}
    </>
  );
};
