import { useMutation } from "@apollo/client/react";
import { X, Loader2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { CREATE_CLASSROOM } from "../../../graphql/mutations/CreateClassroom";

interface ICreateClassroomModal {
  closeCreateClassroomModal: () => void;
  refetchClassrooms: () => void;
}

export const CreateClassroomModal = ({
  closeCreateClassroomModal,
  refetchClassrooms,
}: ICreateClassroomModal) => {
  const [formData, setFormData] = useState({
    name: "",
    capacity: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    capacity: "",
  });

  const [createClassroom, { loading, error }] = useMutation(CREATE_CLASSROOM);

  const validateForm = () => {
    const newErrors = {
      name: "",
      capacity: "",
    };

    let isValid = true;

    // Validar nome
    if (!formData.name.trim()) {
      newErrors.name = "Nome da sala é obrigatório";
      isValid = false;
    }

    // Validar capacidade
    if (!formData.capacity.trim()) {
      newErrors.capacity = "Capacidade é obrigatória";
      isValid = false;
    } else {
      const capacityNumber = parseInt(formData.capacity);
      if (isNaN(capacityNumber) || capacityNumber <= 0) {
        newErrors.capacity = "Capacidade deve ser um número maior que zero";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await createClassroom({
        variables: {
          input: {
            name: formData.name,
            capacity: parseInt(formData.capacity),
          },
        },
      });

      await refetchClassrooms();
      closeCreateClassroomModal();
    } catch (err) {
      console.error("Erro ao criar sala:", err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      closeCreateClassroomModal();
    }
  };

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
        {loading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-lg z-10">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-slate-600 font-medium">Criando sala...</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Nova Sala</h2>
          <button
            onClick={handleCloseModal}
            disabled={loading}
            className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nome da Sala
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed ${
                errors.name ? "border-red-500" : "border-slate-300"
              }`}
              placeholder="Ex: Sala 101"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Capacidade
            </label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              disabled={loading}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed ${
                errors.capacity ? "border-red-500" : "border-slate-300"
              }`}
              placeholder="Ex: 30"
              min="1"
            />
            {errors.capacity && (
              <p className="text-red-500 text-xs mt-1">{errors.capacity}</p>
            )}
          </div>

          {/* Mensagem de erro da mutation */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800 mb-1">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium text-sm">Erro ao criar sala</span>
              </div>
              <p className="text-red-700 text-sm">{error.message}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
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
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors text-sm md:text-base flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Criando...
                </>
              ) : (
                "Cadastrar"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
