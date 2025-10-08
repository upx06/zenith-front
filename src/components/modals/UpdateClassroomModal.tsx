import { useMutation } from "@apollo/client/react";
import { X } from "lucide-react";
import { useState } from "react";
import { UPDATE_CLASSROOM } from "../../graphql/mutations/UpdateClassroom";
import type { IClassroom } from "../../interfaces/IClassroom";

interface IUpdateClassroomModal {
  classroom: IClassroom;
  closeUpdateClassroomModal: () => void;
  refetchClassrooms: () => void;
}

export const UpdateClassroomModal = ({
  classroom,
  closeUpdateClassroomModal,
  refetchClassrooms,
}: IUpdateClassroomModal) => {
  const [formData, setFormData] = useState({
    name: classroom.name,
    capacity: classroom.capacity.toString(),
  });

  const [errors, setErrors] = useState({
    name: "",
    capacity: "",
  });

  const [updateClassroom, { loading, error }] = useMutation(UPDATE_CLASSROOM);

  const validateForm = () => {
    const newErrors = {
      name: "",
      capacity: "",
    };

    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = "Nome da sala é obrigatório";
      isValid = false;
    }

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
      await updateClassroom({
        variables: {
          id: classroom.id,
          input: {
            name: formData.name,
            capacity: parseInt(formData.capacity),
          },
        },
      });

      refetchClassrooms();
      closeUpdateClassroomModal();
    } catch (err) {
      console.error("Erro ao atualizar sala:", err);
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

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={closeUpdateClassroomModal}
    >
      <div
        className="bg-white rounded-lg p-4 md:p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Editar Sala</h2>
          <button
            onClick={closeUpdateClassroomModal}
            className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
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
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base ${
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
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base ${
                errors.capacity ? "border-red-500" : "border-slate-300"
              }`}
              placeholder="Ex: 30"
              min="1"
            />
            {errors.capacity && (
              <p className="text-red-500 text-xs mt-1">{errors.capacity}</p>
            )}
          </div>

          {error && (
            <div className="text-red-600 text-sm">
              Erro ao atualizar sala: {error.message}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={closeUpdateClassroomModal}
              className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors text-sm md:text-base"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors text-sm md:text-base"
            >
              {loading ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
