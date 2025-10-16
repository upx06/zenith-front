import { useState } from "react";
import { X, Calendar, Clock, BookOpen, User, Users, Info } from "lucide-react";
import { ConfirmationModal } from "./ConfirmationModal";
import { ClassDetailsModal } from "./ClassDetailsModal";
import { UpdateClassModal } from "./UpdateClassModal";
import { ManageClassModal } from "./ManageClassModal";
import type { IClass } from "../../interfaces/IClass";

interface DetailsSchedulingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => Promise<void>;
  scheduling: {
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
}

export const DetailsSchedulingModal = ({
  isOpen,
  onClose,
  onEdit,
  onDelete,
  scheduling,
  classData,
  roomName,
  timeSlot,
  date,
  isLoading = false,
}: DetailsSchedulingModalProps) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showClassDetailsModal, setShowClassDetailsModal] = useState(false);
  const [showUpdateClassModal, setShowUpdateClassModal] = useState(false);
  const [showManageClassModal, setShowManageClassModal] = useState(false);

  if (!isOpen) return null;

  const handleDeleteClick = () => {
    setShowConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    await onDelete();
    setShowConfirmation(false);
  };

  const formatDateTimeForDisplay = (dateTimeString: string): string => {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-xl shadow-2xl max-w-md rounded-t-3xl w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 rounded-t-xl flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">
              Detalhes do Agendamento
            </h2>
            <button
              onClick={onClose}
              disabled={isLoading}
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
                  {classData && (
                    <button
                      onClick={() => setShowClassDetailsModal(true)}
                      className="p-1 hover:bg-slate-200 rounded transition-colors"
                      title="Ver detalhes da turma"
                    >
                      <Info className="h-4 w-4 text-blue-600" />
                    </button>
                  )}
                </div>
                <p className="text-base font-semibold text-slate-900 ml-6">
                  {scheduling.class}
                </p>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                onClick={onEdit}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Editar
              </button>
              <button
                onClick={handleDeleteClick}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Excluir</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {showConfirmation && (
        <ConfirmationModal
          onClose={() => !isLoading && setShowConfirmation(false)}
          onConfirm={handleConfirmDelete}
          title="Excluir Agendamento"
          message={`Tem certeza que deseja excluir o agendamento da turma ${
            scheduling.class
          } às ${formatDateTimeForDisplay(scheduling.datetime)} com ${
            scheduling.teacher
          }?`}
          confirmText={isLoading ? "Excluindo..." : "Excluir"}
          cancelText="Cancelar"
          isLoading={isLoading}
          isDisabled={isLoading}
        />
      )}

      {classData && showClassDetailsModal && (
        <ClassDetailsModal
          isOpen={showClassDetailsModal}
          onClose={() => setShowClassDetailsModal(false)}
          classItem={classData}
          onEdit={() => {
            setShowClassDetailsModal(false);
            setShowUpdateClassModal(true);
          }}
          onManage={() => {
            setShowClassDetailsModal(false);
            setShowManageClassModal(true);
          }}
        />
      )}

      {classData && showUpdateClassModal && (
        <UpdateClassModal
          clas={classData}
          closeUpdateClassModal={() => setShowUpdateClassModal(false)}
          refetchClasses={() => {}}
        />
      )}

      {classData && showManageClassModal && (
        <ManageClassModal
          clas={classData}
          closeManageClassModal={() => setShowManageClassModal(false)}
        />
      )}
    </>
  );
};
