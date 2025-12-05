import { useMutation, useQuery } from "@apollo/client/react";
import { X, Loader2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { CREATE_CLASS } from "../../../graphql/mutations/create/CreateClass";
import { LIST_LANGUAGES } from "../../../graphql/queries/ListLanguages";
import type { IListLanguages } from "../../../interfaces/IListLanguages";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

interface ICreateClassModal {
  closeCreateClassModal: () => void;
  refetchClasses: () => void;
}

export const CreateClassModal = ({
  closeCreateClassModal,
  refetchClasses,
}: ICreateClassModal) => {
  const { t } = useTranslation();

  const {
    data: dataLanguage,
    loading: loadingLanguage,
    error: errorLanguage,
  } = useQuery<IListLanguages>(LIST_LANGUAGES);

  const [formData, setFormData] = useState({
    name: "",
    level: "",
    languageId: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    level: "",
    languageId: "",
  });

  const [createClass, { loading, error }] = useMutation(CREATE_CLASS);

  const validateForm = () => {
    const newErrors = {
      name: "",
      level: "",
      languageId: "",
    };

    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = t("common.formRequirements.name");
      isValid = false;
    }

    if (!formData.level.trim()) {
      newErrors.level = t("common.formRequirements.level");
      isValid = false;
    }

    if (!formData.languageId.trim()) {
      newErrors.languageId = t("common.formRequirements.language");
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
            languageId: formData.languageId,
          },
        },
      });

      toast.success(t("toast.class.createSuccess"));
      refetchClasses();
    } catch (err: any) {
      console.error("Erro ao criar turma:", err);
      toast.error(t("toast.class.createError"));
    } finally {
      closeCreateClassModal();
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
      closeCreateClassModal();
    }
  };

  const isLoading = loading || loadingLanguage;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleCloseModal}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-lg p-4 md:p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Overlay de loading */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 flex items-center justify-center rounded-lg z-10">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-slate-600 dark:text-slate-300 font-medium">
                {loading
                  ? t("clas.createClassModal.creating")
                  : t("clas.createClassModal.loadingLanguages")}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
            {t("clas.createClassModal.title")}
          </h2>
          <button
            onClick={handleCloseModal}
            disabled={isLoading}
            className="p-1 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
              {t("common.common.name")}
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={isLoading}
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed ${
                errors.name
                  ? "border-red-500"
                  : "border-slate-300 dark:border-slate-700"
              }`}
              placeholder={t("common.formPlaceholders.fullName")}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
              {t("common.formLabels.language")}
            </label>
            <select
              name="languageId"
              value={formData.languageId}
              onChange={handleChange}
              disabled={isLoading}
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed ${
                errors.languageId
                  ? "border-red-500"
                  : "border-slate-300 dark:border-slate-700"
              }`}
            >
              <option value="">{t("common.formLabels.selectLanguage")}</option>
              {dataLanguage?.listLanguages?.results?.map((language) => (
                <option key={language.id} value={language.id}>
                  {language.name}
                </option>
              ))}
            </select>

            {/* Estados de loading e error das linguagens */}
            {loadingLanguage && !isLoading && (
              <p className="text-blue-500 text-xs mt-1">
                {t("clas.createClassModal.loadingLanguages")}
              </p>
            )}
            {errorLanguage && (
              <div className="p-2 bg-red-50 border border-red-200 rounded mt-1">
                <p className="text-red-600 text-xs">
                  {t("errors.class.languages.loadError")}:{" "}
                  {errorLanguage.message}
                </p>
              </div>
            )}
            {errors.languageId && (
              <p className="text-red-500 text-xs mt-1">{errors.languageId}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
              {t("common.formLabels.level")}
            </label>
            <select
              name="level"
              value={formData.level}
              onChange={handleChange}
              disabled={isLoading}
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed ${
                errors.level
                  ? "border-red-500"
                  : "border-slate-300 dark:border-slate-700"
              }`}
            >
              <option value="">{t("common.filters.byLevel")}</option>
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
                  {t("toast.class.createError")}
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
              className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm md:text-base"
            >
              {t("common.actions.cancel")}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors text-sm md:text-base flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t("common.status.creating")}
                </>
              ) : (
                t("common.actions.register")
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
