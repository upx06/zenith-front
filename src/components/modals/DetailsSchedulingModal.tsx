import { useState } from "react";
import {
  X,
  Calendar,
  Clock,
  BookOpen,
  User,
  Users,
  Trash2,
} from "lucide-react";
import { ConfirmationModal } from "./ConfirmationModal";
import type { IClass } from "../../interfaces/IClass";
import { formatDateTimeForDisplay } from "../../utils/date";
import { useMutation } from "@apollo/client/react";
import { DESTROY_LESSON } from "../../graphql/mutations/DestroyLesson";

interface DetailsSchedulingModalProps {
  onClose: () => void;
  scheduling: {
    id: string;
    subject: string;
    teacher: string;
    class: string;
    datetime: string;
  };
  classData?: IClass;
  roomName: string;
  timeSlot: string;
  date: string;
  isLoading?: boolean;
  refetchScheduling: () => void;
}

export const DetailsSchedulingModal = ({
  onClose,
  scheduling,
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
    } catch (error) {
      console.error("Erro ao excluir agendamento:", error);
    } finally {
      refetchScheduling();
      setShowConfirmation(false);
      onClose();
    }
  };

  const handleCloseConfirmation = () => {
    if (!loadingDeleteLesson) {
      setShowConfirmation(false);
    }
  };

  const isProcessing = isLoading || loadingDeleteLesson;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-xl shadow-2xl max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-blue-600 px-6 py-4 rounded-t-xl flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">
              Detalhes do Agendamento
            </h2>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="text-slate-300 hover:bg-indigo-700 hover:bg-opacity-20 cursor-pointer rounded-lg p-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div className="space-y-3">
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-sm text-slate-600 mb-1">
                  <BookOpen className="h-4 w-4" />
                  <span>Sala</span>
                </div>
                <p className="text-base font-semibold text-slate-900 ml-6">
                  {roomName}
                </p>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-sm text-slate-600 mb-1">
                  <Calendar className="h-4 w-4" />
                  <span>Data</span>
                </div>
                <p className="text-base font-semibold text-slate-900 ml-6">
                  {date}
                </p>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-sm text-slate-600 mb-1">
                  <Clock className="h-4 w-4" />
                  <span>Horário</span>
                </div>
                <p className="text-base font-semibold text-slate-900 ml-6">
                  {timeSlot}
                </p>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-sm text-slate-600 mb-1">
                  <User className="h-4 w-4" />
                  <span>Professor</span>
                </div>
                <p className="text-base font-semibold text-slate-900 ml-6">
                  {scheduling.teacher}
                </p>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center justify-between space-x-2 text-sm text-slate-600 mb-1">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>Turma</span>
                  </div>
                </div>
                <p className="text-base font-semibold text-slate-900 ml-6">
                  {scheduling.class}
                </p>
              </div>
            </div>

            {/* Botão de Excluir */}
            <div className="pt-4 border-t border-slate-200">
              <button
                onClick={handleDeleteClick}
                disabled={isProcessing}
                className="w-full px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingDeleteLesson ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Excluindo...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    <span>Excluir Agendamento</span>
                  </>
                )}
              </button>
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
