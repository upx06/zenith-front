import { useState } from "react";
import { X, Calendar, Clock, BookOpen, User, Users } from "lucide-react";
import { useQuery } from "@apollo/client/react";
import { LIST_TEACHERS } from "../../../graphql/queries/ListTeachers";
import { LIST_CLASSES } from "../../../graphql/queries/ListClasses";
import type { ITeacher } from "../../../interfaces/ITeacher";
import type { IClass } from "../../../interfaces/IClass";

interface ListTeachersData {
  listTeachers: {
    results: ITeacher[];
  };
}

interface ListClassesData {
  listClasses: {
    results: IClass[];
  };
}

interface CreateSchedulingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    datetime: string;
    classroomId: string;
    teacherId: string;
    classId: string;
  }) => Promise<void>;
  roomName: string;
  classroomId: string;
  timeSlot: string;
  date: Date;
}

export const CreateSchedulingModal = ({
  isOpen,
  onClose,
  onSubmit,
  roomName,
  classroomId,
  timeSlot,
  date,
}: CreateSchedulingModalProps) => {
  const [teacherId, setTeacherId] = useState("");
  const [classId, setClassId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: teachersData, loading: teachersLoading } =
    useQuery<ListTeachersData>(LIST_TEACHERS);

  const { data: classesData, loading: classesLoading } =
    useQuery<ListClassesData>(LIST_CLASSES);

  const teachers = teachersData?.listTeachers?.results || [];
  const classes = classesData?.listClasses?.results || [];

  const createDateTimeFromSlot = (selectedDate: Date, slot: string): string => {
    const [hours, minutes] = slot.split(":");
    const datetime = new Date(selectedDate);
    datetime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return datetime.toISOString();
  };

  const formatDateDisplay = (selectedDate: Date): string => {
    return selectedDate.toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherId || !classId) return;

    setIsSubmitting(true);
    try {
      const datetime = createDateTimeFromSlot(date, timeSlot);

      await onSubmit({
        datetime,
        classroomId,
        teacherId,
        classId,
      });

      setTeacherId("");
      setClassId("");
      onClose();
    } catch (error) {
      console.error("Erro ao criar agendamento:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setTeacherId("");
    setClassId("");
    onClose();
  };

  if (!isOpen) return null;

  const formattedDate = formatDateDisplay(date);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Novo Agendamento</h2>
          <button
            onClick={handleClose}
            className="text-slate-300 hover:bg-indigo-700 hover:bg-opacity-20 cursor-pointer rounded-lg p-2 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-slate-50 rounded-lg p-4 space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <BookOpen className="h-4 w-4 text-slate-600" />
              <span className="text-slate-600">Sala:</span>
              <span className="font-semibold text-slate-900">{roomName}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Clock className="h-4 w-4 text-slate-600" />
              <span className="text-slate-600">Horário:</span>
              <span className="font-semibold text-slate-900">{timeSlot}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Calendar className="h-4 w-4 text-slate-600" />
              <span className="text-slate-600">Data:</span>
              <span className="font-semibold text-slate-900">
                {formattedDate}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Professor</span>
                </div>
              </label>
              <select
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={teachersLoading || isSubmitting}
              >
                <option value="">
                  {teachersLoading
                    ? "Carregando professores..."
                    : "Selecione um professor"}
                </option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Turma</span>
                </div>
              </label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={classesLoading || isSubmitting}
              >
                <option value="">
                  {classesLoading
                    ? "Carregando turmas..."
                    : "Selecione uma turma"}
                </option>
                {classes.map((classItem) => (
                  <option key={classItem.id} value={classItem.id}>
                    {classItem.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer font-semibold"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting || !teacherId || !classId}
              >
                {isSubmitting ? "Criando..." : "Criar Agendamento"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
