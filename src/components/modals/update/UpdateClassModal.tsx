import { useMutation, useQuery } from "@apollo/client/react";
import { X, Loader2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { UPDATE_CLASS } from "../../../graphql/mutations/update/UpdateClass";
import { LIST_LANGUAGES } from "../../../graphql/queries/ListLanguages";
import type { IClass } from "../../../interfaces/IClass";
import type { IListLanguages } from "../../../interfaces/IListLanguages";
import toast from "react-hot-toast";

interface IUpdateClassModal {
  clas: IClass;
  closeUpdateClassModal: () => void;
  refetchClasses: () => void;
}

export const UpdateClassModal = ({
  clas,
  closeUpdateClassModal,
  refetchClasses,
}: IUpdateClassModal) => {
  if (!clas) return null;

  const {
    data: dataLanguage,
    loading: loadingLanguage,
    error: errorLanguage,
  } = useQuery<IListLanguages>(LIST_LANGUAGES);

  const [formData, setFormData] = useState({
    name: clas.name || "",
    level: clas.level || "",
    languageId: clas.languageId || "",
  });

  const [errors, setErrors] = useState({
    name: "",
    level: "",
    languageId: "",
  });

  const [updateClass, { loading, error }] = useMutation(UPDATE_CLASS);

  const validateForm = () => {
    const newErrors = {
      name: "",
      level: "",
      languageId: "",
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

    if (!formData.languageId.trim()) {
      newErrors.languageId = "Linguagem é obrigatória";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await updateClass({
        variables: {
          id: clas.id,
          input: {
            name: formData.name,
            level: formData.level,
            languageId: formData.languageId,
          },
        },
      });

      toast.success("Turma atualizada com sucesso!");
      await refetchClasses();
      closeUpdateClassModal();
    } catch (err: any) {
      console.error("Erro ao atualizar turma:", err);
      const errorMessage = err.message || "Erro ao atualizar turma";

      if (
        errorMessage.includes("already exists") ||
        errorMessage.includes("já existe")
      ) {
        toast.error("Esta turma já está cadastrada");
      } else if (errorMessage.includes("Duplicate")) {
        toast.error("Já existe uma turma com este nome");
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
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
      closeUpdateClassModal();
    }
  };

  const isLoading = loading || loadingLanguage;

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
                {loading ? "Atualizando turma..." : "Carregando linguagens..."}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Editar Turma</h2>
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
              Nome
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
              placeholder="Nome da turma"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Linguagem
            </label>
            <select
              name="languageId"
              value={formData.languageId}
              onChange={handleChange}
              disabled={isLoading}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed ${
                errors.languageId ? "border-red-500" : "border-slate-300"
              }`}
            >
              <option value="">Selecione a linguagem</option>
              {dataLanguage?.listLanguages?.results?.map((language) => (
                <option key={language.id} value={language.id}>
                  {language.name}
                </option>
              ))}
            </select>

            {/* Estados de loading e error das linguagens */}
            {loadingLanguage && !isLoading && (
              <p className="text-blue-500 text-xs mt-1">
                Carregando linguagens...
              </p>
            )}
            {errorLanguage && (
              <div className="p-2 bg-red-50 border border-red-200 rounded mt-1">
                <p className="text-red-600 text-xs">
                  Erro ao carregar linguagens: {errorLanguage.message}
                </p>
              </div>
            )}
            {errors.languageId && (
              <p className="text-red-500 text-xs mt-1">{errors.languageId}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nível
            </label>
            <select
              name="level"
              value={formData.level}
              onChange={handleChange}
              disabled={isLoading}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed ${
                errors.level ? "border-red-500" : "border-slate-300"
              }`}
            >
              <option value="">Selecione o nível</option>
              <option value="A1">A1</option>
              <option value="A2">A2</option>
              <option value="B1">B1</option>
              <option value="B2">B2</option>
              <option value="C1">C1</option>
              <option value="C2">C2</option>
            </select>
            {errors.level && (
              <p className="text-red-500 text-xs mt-1">{errors.level}</p>
            )}
          </div>

          {/* Mensagem de erro da mutation */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800 mb-1">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium text-sm">
                  Erro ao atualizar turma
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
                  Atualizando...
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
