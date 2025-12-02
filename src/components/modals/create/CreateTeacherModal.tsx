import { useMutation } from "@apollo/client/react";
import { X, Loader2, AlertCircle, Upload, Camera } from "lucide-react";
import { useState, useRef } from "react";
import { IMaskInput } from "react-imask";
import { CREATE_TEACHER } from "../../../graphql/mutations/create/CreateTeacher";
import { sendToAwsS3 } from "../../../utils/aws";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

interface ICreateTeacherModal {
  closeCreateTeacherModal: () => void;
  refetchTeachers: () => void;
}

export const CreateTeacherModal = ({
  closeCreateTeacherModal,
  refetchTeachers,
}: ICreateTeacherModal) => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
    photo: "",
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [createTeacher, { loading, error }] = useMutation(CREATE_TEACHER);

  const validateForm = () => {
    const newErrors = {
      name: "",
      email: "",
      phone: "",
      photo: "",
    };

    let isValid = true;

    // Validar nome
    if (!formData.name.trim()) {
      newErrors.name = t("common.formRequirements.name");
      isValid = false;
    }

    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = t("common.formRequirements.email");
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t("common.formErrors.invalidEmail");
      isValid = false;
    }

    // Validar telefone
    if (!formData.phone.trim()) {
      newErrors.phone = t("common.formRequirements.phone");
      isValid = false;
    } else {
      const cleanPhone = formData.phone.replace(/\D/g, "");
      if (cleanPhone.length < 10) {
        newErrors.phone = t("common.formErrors.invalidPhone");
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          photo: t("common.formErrors.invalidImage"),
        }));
        return;
      }

      setPhotoFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Limpar erro
      setErrors((prev) => ({
        ...prev,
        photo: "",
      }));
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      let photoKey = null;

      if (photoFile) {
        const data = await sendToAwsS3(photoFile, "profile-photo");

        if (data && data.key) photoKey = data.key;
      }

      await createTeacher({
        variables: {
          input: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            photoKey: photoKey,
          },
        },
      });

      toast.success(t("toast.teacher.createSuccess"));
      await refetchTeachers();
      handleCloseModal();
    } catch (err: any) {
      console.error("Erro ao criar professor:", err);
      // const errorMessage = err.message || "Erro ao criar professor";

      toast.error(t("toast.teacher.createError"));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handlePhoneChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      phone: value,
    }));

    if (errors.phone) {
      setErrors((prev) => ({
        ...prev,
        phone: "",
      }));
    }
  };

  const handleCloseModal = () => {
    if (!loading) {
      // Limpar preview e arquivo ao fechar
      handleRemovePhoto();
      closeCreateTeacherModal();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleCloseModal}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-lg p-4 md:p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {loading && (
          <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 flex items-center justify-center rounded-lg z-10">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-slate-600 dark:text-slate-300 font-medium">
                {t("teacher.createTeacherModal.creatingTeacher")}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
            {t("teacher.createTeacherModal.title")}
          </h2>
          <button
            onClick={handleCloseModal}
            disabled={loading}
            className="p-1 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Seção de Foto */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                {t("common.formLabels.photo")}
              </label>
              <div className="space-y-3">
                {/* Preview da foto */}
                <div className="relative aspect-square w-full max-w-[200px] mx-auto">
                  {photoPreview ? (
                    <div className="relative w-full h-full rounded-lg overflow-hidden border-2 border-slate-200 dark:border-slate-700 group">
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        disabled={loading}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-full rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <Camera className="w-12 h-12 text-slate-400 dark:text-slate-500" />
                      <p className="text-xs text-slate-500 dark:text-slate-400 text-center px-2">
                        {t("common.formLabels.clickToAddPhoto")}
                      </p>
                    </div>
                  )}
                </div>

                {/* Input de arquivo (oculto) */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  disabled={loading}
                  className="hidden"
                />

                {/* Botão de upload */}
                {!photoPreview && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    {t("common.formLabels.choosePhoto")}
                  </button>
                )}

                {errors.photo && (
                  <p className="text-red-500 text-xs text-center">
                    {errors.photo}
                  </p>
                )}
              </div>
            </div>

            {/* Seção de Dados */}
            <div className="md:col-span-2 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                  {t("common.common.name")}
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading}
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
                  {t("common.formLabels.email")}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed ${
                    errors.email
                      ? "border-red-500"
                      : "border-slate-300 dark:border-slate-700"
                  }`}
                  placeholder={t("common.formPlaceholders.email")}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                  {t("common.formLabels.phone")}
                </label>
                <IMaskInput
                  mask={[
                    {
                      mask: "(00) 0000-0000",
                    },
                    {
                      mask: "(00) 00000-0000",
                    },
                  ]}
                  value={formData.phone}
                  onAccept={handlePhoneChange}
                  disabled={loading}
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed ${
                    errors.phone
                      ? "border-red-500"
                      : "border-slate-300 dark:border-slate-700"
                  }`}
                  placeholder="(11) 99999-9999"
                  unmask={true}
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800 mb-1">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium text-sm">
                  {t("toast.teacher.createError")}
                </span>
              </div>
              <p className="text-red-700 text-sm">{error.message}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={handleCloseModal}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm md:text-base"
            >
              {t("common.actions.cancel")}
            </button>
            <button
              type="submit"
              disabled={loading}
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
