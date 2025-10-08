import { X, BookOpen, Edit3, Trash2 } from 'lucide-react';

interface Scheduling {
  subject: string;
  teacher: string;
  class: string;
}

interface DetailsSchedulingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  scheduling: Scheduling;
  roomName: string;
  timeSlot: string;
  date: string;
}

export const DetailsSchedulingModal = ({
  isOpen,
  onClose,
  onEdit,
  onDelete,
  scheduling,
  roomName,
  timeSlot,
  date
}: DetailsSchedulingModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Detalhes do Agendamento</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-slate-500" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
              <div className="flex items-center space-x-2 mb-2">
                <BookOpen className="h-4 w-4 text-blue-600" />
                <h4 className="font-semibold text-blue-900">{scheduling.subject}</h4>
              </div>
              <p className="text-sm text-slate-600 mb-1">
                <strong>Professor:</strong> {scheduling.teacher}
              </p>
              <p className="text-sm text-slate-600">
                <strong>Turma:</strong> {scheduling.class}
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg">
              <p className="text-sm text-slate-600">
                <strong>Sala:</strong> {roomName}
              </p>
              <p className="text-sm text-slate-600">
                <strong>Horário:</strong> {timeSlot}
              </p>
              <p className="text-sm text-slate-600">
                <strong>Data:</strong> {date}
              </p>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                onClick={onEdit}
              >
                <Edit3 className="h-4 w-4" />
                Editar
              </button>
              <button
                onClick={onDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Excluir
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};