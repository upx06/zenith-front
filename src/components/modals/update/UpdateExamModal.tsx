import { useMutation } from "@apollo/client/react";
import { X, Loader2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { UPDATE_EXAM_BASIC } from "../../../graphql/mutations/update/UpdateExamBasic";
import type { IExam } from "../../../interfaces/IExam";
import toast from "react-hot-toast";
import { useTeachers } from "../../../hooks/useTeachers";

interface IUpdateExamModal {
  exam: IExam;
  closeUpdateExamModal: () => void;
  refetchExams: () => void;
}

export const UpdateExamModal = ({
  exam,
  closeUpdateExamModal,
  refetchExams,
}: IUpdateExamModal) => {
  const [formData, setFormData] = useState({
    name: exam.name,
    teacherId: exam.teacher?.id || "",
  });

  const [errors, setErrors] = useState({
    name: "",
    teacherId: "",
  });

  const { teachers, loading: loadingTeachers } = useTeachers();
  const [updateExam, { loading, error }] = useMutation(UPDATE_EXAM_BASIC);

  const validateForm = () => {
    const newErrors = {
      name: "",
      teacherId: "",
    };

    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = "Nome da avaliação é obrigatório";
      isValid = false;
    }

    if (!formData.teacherId) {
      newErrors.teacherId = "Professor é obrigatório";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await updateExam({
        variables: {
          id: exam.id,
          input: {
            name: formData.name,
            teacherId: formData.teacherId,
          },
        },
      });

      toast.success("Avaliação atualizada com sucesso!");
      refetchExams();
      closeUpdateExamModal();
    } catch (err: any) {
      console.error("Erro ao atualizar avaliação:", err);
      const errorMessage = err.message || "Erro ao atualizar avaliação";

      if (
        errorMessage.includes("already exists") ||
        errorMessage.includes("já existe")
      ) {
        toast.error("Esta avaliação já está cadastrada");
      } else if (errorMessage.includes("Duplicate")) {
        toast.error("Já existe uma avaliação com este nome");
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleCloseModal = () => {
    if (!loading) {
      closeUpdateExamModal();
    }
  };

  const isLoading = loading || loadingTeachers;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleCloseModal}
    >
      <div
        className="bg-white rounded-lg p-4 md:p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Overlay de loading */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-lg z-10">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-slate-600 font-medium">
                {loading ? "Atualizando avaliação..." : "Carregando professores..."}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">
            Editar Avaliação
          </h2>
          <button
            onClick={handleCloseModal}
            disabled={isLoading}
            className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nome da Avaliação
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={isLoading}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed ${
                errors.name ? "border-red-500" : "border-slate-300"
              }`}
              placeholder="Ex: Prova de Final de Módulo"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Professor Responsável
            </label>
            <select
              name="teacherId"
              value={formData.teacherId}
              onChange={handleChange}
              disabled={isLoading}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed ${
                errors.teacherId ? "border-red-500" : "border-slate-300"
              }`}
            >
              <option value="">Selecione um professor</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))}
            </select>
            {errors.teacherId && (
              <p className="text-red-500 text-xs mt-1">{errors.teacherId}</p>
            )}
          </div>

          {/* Mensagem de erro da mutation */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800 mb-1">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium text-sm">
                  Erro ao atualizar avaliação
                </span>
              </div>
              <p className="text-red-700 text-sm">{error.message}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleCloseModal}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm md:text-base"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors text-sm md:text-base flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
