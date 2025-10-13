import { X, Calendar, Clock, BookOpen, User, Users, Trash2 } from "lucide-react";

interface DetailsSchedulingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => Promise<void>;
  scheduling: {
    subject: string;
    teacher: string;
    class: string;
  };
  roomName: string;
  timeSlot: string;
  date: string;
}

export const DetailsSchedulingModal = ({
  isOpen,
  onClose,
  onDelete,
  scheduling,
  roomName,
  timeSlot,
  date,
}: DetailsSchedulingModalProps) => {
  if (!isOpen) return null;

  const handleDelete = async () => {
    if (window.confirm("Tem certeza que deseja excluir este agendamento?")) {
      await onDelete();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Detalhes do Agendamento</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
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
              <div className="flex items-center space-x-2 text-sm text-slate-600 mb-1">
                <Users className="h-4 w-4" />
                <span>Turma</span>
              </div>
              <p className="text-base font-semibold text-slate-900 ml-6">
                {scheduling.class}
              </p>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-semibold"
            >
              Fechar
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-semibold flex items-center justify-center space-x-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>Excluir</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};