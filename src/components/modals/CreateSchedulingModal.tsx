import { X } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { LIST_TEACHERS } from "../../graphql/queries/ListTeachers";
import { LIST_CLASSES } from "../../graphql/queries/ListClasses";

interface Scheduling {
  teacherId: string;
  classId: string;
}

interface CreateSchedulingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (scheduling: Scheduling) => void;
  roomName: string;
  timeSlot: string;
  date: string;
}

interface Teacher {
  id: string;
  name: string;
}

interface Class {
  id: string;
  name: string;
}

interface ListTeachersData {
  listTeachers: {
    results: Teacher[];
  };
}

interface ListClassesData {
  listClasses: {
    results: Class[];
  };
}

export const CreateSchedulingModal = ({
  isOpen,
  onClose,
  onSubmit,
  roomName,
  timeSlot,
  date,
}: CreateSchedulingModalProps) => {
  const [formData, setFormData] = useState({
    teacherId: "",
    classId: "",
  });

  const { data: teachersData, loading: teachersLoading } =
    useQuery<ListTeachersData>(LIST_TEACHERS);
  const { data: classesData, loading: classesLoading } =
    useQuery<ListClassesData>(LIST_CLASSES);

  const teachers = teachersData?.listTeachers?.results || [];
  const classes = classesData?.listClasses?.results || [];

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.teacherId && formData.classId) {
      onSubmit(formData);
      setFormData({ teacherId: "", classId: "" });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">
              Novo Agendamento
            </h3>
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
                  Professor
                </label>
                {teachersLoading ? (
                  <div className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50">
                    <span className="text-sm text-slate-500">
                      Carregando professores...
                    </span>
                  </div>
                ) : (
                  <select
                    value={formData.teacherId}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        teacherId: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Selecione um professor</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Turma
                </label>
                {classesLoading ? (
                  <div className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50">
                    <span className="text-sm text-slate-500">
                      Carregando turmas...
                    </span>
                  </div>
                ) : (
                  <select
                    value={formData.classId}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        classId: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Selecione uma turma</option>
                    {classes.map((classItem) => (
                      <option key={classItem.id} value={classItem.id}>
                        {classItem.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={teachersLoading || classesLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
