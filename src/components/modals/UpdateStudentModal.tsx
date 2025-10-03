// components/modals/UpdateStudentModal.tsx
import { useMutation } from "@apollo/client/react";
import { X } from "lucide-react";
import { useState } from "react";
import { IMaskInput } from "react-imask";
import { UPDATE_STUDENT } from "../../graphql/mutations/UpdateStudent";
import type { IStudent } from "../../interfaces/IStudent";

interface IUpdateStudentModal {
  student: IStudent;
  closeUpdateStudentModal: () => void;
  refetchStudents: () => void;
}

export const UpdateStudentModal = ({
  student,
  closeUpdateStudentModal,
  refetchStudents,
}: IUpdateStudentModal) => {
  const [formData, setFormData] = useState({
    name: student.name,
    email: student.email,
    phone: student.phone,
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [updateStudent, { loading, error }] = useMutation(UPDATE_STUDENT);

  const validateForm = () => {
    const newErrors = {
      name: "",
      email: "",
      phone: "",
    };

    let isValid = true;

    // Validar nome
    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
      isValid = false;
    }

    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido";
      isValid = false;
    }

    // Validar telefone
    if (!formData.phone.trim()) {
      newErrors.phone = "Telefone é obrigatório";
      isValid = false;
    } else {
      const cleanPhone = formData.phone.replace(/\D/g, "");
      if (cleanPhone.length < 10) {
        newErrors.phone = "Telefone inválido";
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
      await updateStudent({
        variables: {
          id: student.id,
          input: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
          },
        },
      });

      refetchStudents();
      closeUpdateStudentModal();
    } catch (err) {
      console.error("Erro ao atualizar aluno:", err);
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

  const handlePhoneChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      phone: value,
    }));

    // Limpar erro do telefone quando o usuário digitar
    if (errors.phone) {
      setErrors((prev) => ({
        ...prev,
        phone: "",
      }));
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={closeUpdateStudentModal}
    >
      <div
        className="bg-white rounded-lg p-4 md:p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Editar Aluno</h2>
          <button
            onClick={closeUpdateStudentModal}
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
              placeholder="Nome completo do aluno"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base ${
                errors.email ? "border-red-500" : "border-slate-300"
              }`}
              placeholder="email@exemplo.com"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Telefone
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
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base ${
                errors.phone ? "border-red-500" : "border-slate-300"
              }`}
              placeholder="(11) 99999-9999"
              unmask={true}
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
            )}
          </div>

          {error && (
            <div className="text-red-600 text-sm">
              Erro ao atualizar aluno: {error.message}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={closeUpdateStudentModal}
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
