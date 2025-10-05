import { useMutation } from "@apollo/client/react";
import { X } from "lucide-react";
import { useState } from "react";
import { CREATE_CLASS } from "../../graphql/mutations/CreateClass";

interface ICreateClassModal {
  closeCreateClassModal: () => void;
  refetchClasses: () => void;
}

export const CreateClassModal = ({
  closeCreateClassModal,
  refetchClasses,
}: ICreateClassModal) => {
  const [formData, setFormData] = useState({
    name: "",
    level: "",
    description: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    level: "",
    description: "",
  });

  const [createClass, { loading, error }] = useMutation(CREATE_CLASS);

  const validateForm = () => {
    const newErrors = {
      name: "",
      level: "",
      description: "",
    };

    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
      isValid = false;
    }

    if (!formData.level.trim()) {
      newErrors.level = "Nível é obrigatório";
      isValid = false;
    }

    if (!formData.description.trim()) {
      newErrors.description = "Descrição é obrigatória";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await createClass({
        variables: {
          input: {
            name: formData.name,
            level: formData.level,
            description: formData.description,
          },
        },
      });

      refetchClasses();
      closeCreateClassModal();
    } catch (err) {
      console.error("Erro ao criar turma:", err);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={closeCreateClassModal}
    >
      <div
        className="bg-white rounded-lg p-4 md:p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Nova Turma</h2>
          <button
            onClick={closeCreateClassModal}
            className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nome
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base ${
                errors.name ? "border-red-500" : "border-slate-300"
              }`}
              placeholder="Nome da turma"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nível
            </label>
            <input
              type="text"
              name="level"
              value={formData.level}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base ${
                errors.level ? "border-red-500" : "border-slate-300"
              }`}
              placeholder="Ex: Iniciante, Intermediário, Avançado"
            />
            {errors.level && (
              <p className="text-red-500 text-xs mt-1">{errors.level}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Descrição
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base resize-none ${
                errors.description ? "border-red-500" : "border-slate-300"
              }`}
              placeholder="Descrição da turma"
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">{errors.description}</p>
            )}
          </div>

          {error && (
            <div className="text-red-600 text-sm">
              Erro ao criar turma: {error.message}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={closeCreateClassModal}
              className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors text-sm md:text-base"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors text-sm md:text-base"
            >
              {loading ? "Criando..." : "Cadastrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
