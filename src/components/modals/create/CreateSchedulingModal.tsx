import { useMutation } from "@apollo/client/react";
import {
  X,
  Loader2,
  AlertCircle,
  Calendar,
  Clock,
  BookOpen,
  User,
  Users,
} from "lucide-react";
import { useState } from "react";
import { CREATE_LESSON } from "../../../graphql/mutations/CreateLesson";
import { LIST_TEACHERS } from "../../../graphql/queries/ListTeachers";
import { LIST_CLASSES } from "../../../graphql/queries/ListClasses";
import { useQuery } from "@apollo/client/react";
import type { ITeacher } from "../../../interfaces/ITeacher";
import type { IClass } from "../../../interfaces/IClass";
import { formatDateDisplay } from "../../../utils/date";
import toast from "react-hot-toast";

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
  onClose: () => void;
  refetchScheduling: () => void;
  classroomId: string;
  classroomName: string;
  timeSlot: string;
  date: Date;
  isLoading?: boolean;
}

export const CreateSchedulingModal = ({
  onClose,
  refetchScheduling,
  classroomId,
  classroomName,
  timeSlot,
  date,
  isLoading = false,
}: CreateSchedulingModalProps) => {
  const [formData, setFormData] = useState({
    teacherId: "",
    classId: "",
  });

  const [errors, setErrors] = useState({
    teacherId: "",
    classId: "",
  });

  const [
    createLesson,
    { loading: createLessonLoading, error: createLessonError },
  ] = useMutation(CREATE_LESSON);

  const {
    data: teachersData,
    loading: teachersLoading,
    error: teachersError,
  } = useQuery<ListTeachersData>(LIST_TEACHERS);

  const {
    data: classesData,
    loading: classesLoading,
    error: classesError,
  } = useQuery<ListClassesData>(LIST_CLASSES);

  const teachers = teachersData?.listTeachers?.results || [];
  const classes = classesData?.listClasses?.results || [];

  const loading = createLessonLoading || isLoading;
  const queriesLoading = teachersLoading || classesLoading;
  const hasQueryErrors = teachersError || classesError;
  const queriesLoaded = !queriesLoading && !hasQueryErrors;

  const validateForm = () => {
    const newErrors = {
      teacherId: "",
      classId: "",
    };

    let isValid = true;

    if (!formData.teacherId.trim()) {
      newErrors.teacherId = "Professor é obrigatório";
      isValid = false;
    }

    if (!formData.classId.trim()) {
      newErrors.classId = "Turma é obrigatória";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const createDateTimeFromSlot = (selectedDate: Date, slot: string): string => {
    const [hours, minutes] = slot.split(":");
    const datetime = new Date(selectedDate);
    datetime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return datetime.toISOString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const datetime = createDateTimeFromSlot(date, timeSlot);

      await createLesson({
        variables: {
          input: {
            datetime: datetime,
            classroomId: classroomId,
            teacherId: formData.teacherId,
            classId: formData.classId,
          },
        },
      });

      toast.success("Aula criada com sucesso!");
      refetchScheduling();
      handleCloseModal();
    } catch (err: any) {
      console.error("Erro ao criar agendamento:", err);
      const errorMessage = err.message || "Erro ao criar agendamento";

      if (errorMessage.includes("already exists") || errorMessage.includes("já existe")) {
        toast.error("Já existe uma aula agendada para este horário");
      } else if (errorMessage.includes("Duplicate")) {
        toast.error("Já existe uma aula agendada para este horário");
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleCloseModal = () => {
    if (!loading) {
      setFormData({
        teacherId: "",
        classId: "",
      });
      setErrors({
        teacherId: "",
        classId: "",
      });
      onClose();
    }
  };

  const formattedDate = formatDateDisplay(date);

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleCloseModal}
    >
      <div
        className="bg-white rounded-lg p-4 md:p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {loading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-lg z-10">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-slate-600 font-medium">
                Criando agendamento...
              </p>
            </div>
          </div>
        )}

        {queriesLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
            <p className="text-slate-600 font-medium text-center">
              Carregando dados...
            </p>
          </div>
        )}

        {queriesLoaded && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-800">
                Novo Agendamento
              </h2>
              <button
                onClick={handleCloseModal}
                disabled={loading}
                className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Informações do agendamento */}
            <div className="bg-slate-50 rounded-lg p-4 space-y-3 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <BookOpen className="w-4 h-4 text-slate-600 shrink-0" />
                <span className="text-slate-600">Sala:</span>
                <span className="font-semibold text-slate-900">
                  {classroomName}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-slate-600 shrink-0" />
                <span className="text-slate-600">Horário:</span>
                <span className="font-semibold text-slate-900">{timeSlot}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-slate-600 shrink-0" />
                <span className="text-slate-600">Data:</span>
                <span className="font-semibold text-slate-900 capitalize">
                  {formattedDate}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {/* Professor */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>Professor</span>
                  </div>
                </label>
                <select
                  value={formData.teacherId}
                  onChange={(e) => handleChange("teacherId", e.target.value)}
                  disabled={loading}
                  className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed ${
                    errors.teacherId ? "border-red-500" : "border-slate-300"
                  }`}
                  required
                >
                  <option value="">Selecione um professor</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </option>
                  ))}
                </select>
                {errors.teacherId && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.teacherId}
                  </p>
                )}
              </div>

              {/* Turma */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>Turma</span>
                  </div>
                </label>
                <select
                  value={formData.classId}
                  onChange={(e) => handleChange("classId", e.target.value)}
                  disabled={loading}
                  className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed ${
                    errors.classId ? "border-red-500" : "border-slate-300"
                  }`}
                  required
                >
                  <option value="">Selecione uma turma</option>
                  {classes.map((classItem) => (
                    <option key={classItem.id} value={classItem.id}>
                      {classItem.name}
                    </option>
                  ))}
                </select>
                {errors.classId && (
                  <p className="text-red-500 text-xs mt-1">{errors.classId}</p>
                )}
              </div>

              {/* Erro da mutation */}
              {createLessonError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-800 mb-1">
                    <AlertCircle className="w-4 h-4" />
                    <span className="font-medium text-sm">
                      Erro ao criar agendamento
                    </span>
                  </div>
                  <p className="text-red-700 text-sm">
                    {createLessonError.message}
                  </p>
                </div>
              )}

              {/* Botões */}
              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm md:text-base"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || !formData.teacherId || !formData.classId}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors text-sm md:text-base flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    "Criar Agendamento"
                  )}
                </button>
              </div>
            </form>
          </>
        )}

        {/* Erros das queries - mostra mesmo durante o loading */}
        {hasQueryErrors && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800 mb-1">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium text-sm">
                Erro ao carregar dados
              </span>
            </div>
            <p className="text-red-700 text-sm">
              {teachersError?.message || classesError?.message}
            </p>
            <button
              onClick={handleCloseModal}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm w-full"
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
