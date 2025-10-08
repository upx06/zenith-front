import { X } from 'lucide-react';
import { useState } from 'react';

interface Scheduling {
  subject: string;
  teacher: string;
  class: string;
}

interface SchedulingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (scheduling: Scheduling) => void;
  roomName: string;
  timeSlot: string;
  date: string;
}

export const CreateSchedulingModal = ({
  isOpen,
  onClose,
  onSubmit,
  roomName,
  timeSlot,
  date
}: SchedulingModalProps) => {
  const [formData, setFormData] = useState({
    subject: '',
    teacher: '',
    class: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.subject && formData.teacher && formData.class) {
      onSubmit(formData);
      setFormData({ subject: '', teacher: '', class: '' });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Novo Agendamento</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-slate-500" />
            </button>
          </div>

          <div className="space-y-4">
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Matéria/Disciplina
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Matemática"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Professor
                </label>
                <input
                  type="text"
                  value={formData.teacher}
                  onChange={(e) => setFormData(prev => ({ ...prev, teacher: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Prof. Silva"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Turma
                </label>
                <input
                  type="text"
                  value={formData.class}
                  onChange={(e) => setFormData(prev => ({ ...prev, class: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: 9º A"
                  required
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                >
                  Criar Agendamento
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};