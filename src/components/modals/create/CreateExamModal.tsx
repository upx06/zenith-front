import { useState, useEffect } from "react";
import { useMutation } from "@apollo/client/react";
import { X, Loader2, Plus, Trash2, ClipboardList } from "lucide-react";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";

import { CREATE_EXAM } from "../../../graphql/mutations/create/CreateExam";

import { useTeachers } from "../../../hooks/useTeachers";
import { useEnrollments } from "../../../hooks/useEnrollments";
import { useClasses } from "../../../hooks/useClasses";

interface ICreateExamModal {
  closeCreateExamModal: () => void;
  refetchExams: () => void;
}

interface ITopic {
  id: string;
  name: string;
  description: string;
}

export const CreateExamModal = ({
  closeCreateExamModal,
  refetchExams,
}: ICreateExamModal) => {
  const [formData, setFormData] = useState({
    name: "",
    teacherId: "",
    evaluationType: "class" as "class" | "student",
    classId: "",
    enrollmentId: "",
  });

  const [topics, setTopics] = useState<ITopic[]>([
    { id: uuidv4(), name: "", description: "" },
  ]);

  const [errors, setErrors] = useState({
    name: "",
    teacherId: "",
    classId: "",
    enrollmentId: "",
    topics: "",
  });

  const { classes, loading: loadingClasses } = useClasses();
  const { enrollments, loading: loadingEnrollments } = useEnrollments();
  const { teachers, loading: loadingTeachers } = useTeachers();

  const [createExam, { loading: loadingCreateExam, error: errorCreateExam }] =
    useMutation(CREATE_EXAM);

  useEffect(() => {
    if (errorCreateExam) {
      toast.error(errorCreateExam.message || "Erro ao criar avaliação");
    }
  }, [errorCreateExam]);

  const validateForm = () => {
    const newErrors = {
      name: "",
      teacherId: "",
      classId: "",
      enrollmentId: "",
      topics: "",
    };

    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
      isValid = false;
    }

    if (!formData.teacherId) {
      newErrors.teacherId = "Professor é obrigatório";
      isValid = false;
    }

    if (formData.evaluationType === "class" && !formData.classId) {
      newErrors.classId = "Turma é obrigatória";
      isValid = false;
    }

    if (formData.evaluationType === "student" && !formData.enrollmentId) {
      newErrors.enrollmentId = "Matrícula é obrigatória";
      isValid = false;
    }

    const hasEmptyTopic = topics.some((topic) => !topic.name.trim());
    if (topics.length === 0) {
      newErrors.topics = "Adicione pelo menos um tópico";
      isValid = false;
    } else if (hasEmptyTopic) {
      newErrors.topics = "Todos os tópicos devem ter um nome";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const result = await createExam({
      variables: {
        input: {
          name: formData.name,
          classId:
            formData.evaluationType === "class" ? formData.classId : null,
          enrollmentId:
            formData.evaluationType === "student"
              ? formData.enrollmentId
              : null,
          teacherId: formData.teacherId,
          topics: topics.map((topic) => ({
            name: topic.name,
          })),
        },
      },
    });

    if (result.data) {
      toast.success("Avaliação criada com sucesso!");
      refetchExams();
      closeCreateExamModal();
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

    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleEvaluationTypeChange = (type: "class" | "student") => {
    setFormData((prev) => ({
      ...prev,
      evaluationType: type,
      classId: "",
      enrollmentId: "",
    }));
    setErrors((prev) => ({
      ...prev,
      classId: "",
      enrollmentId: "",
    }));
  };

  const addTopic = () => {
    setTopics((prev) => [...prev, { id: uuidv4(), name: "", description: "" }]);
  };

  const removeTopic = (id: string) => {
    if (topics.length > 1) {
      setTopics((prev) => prev.filter((topic) => topic.id !== id));
    }
  };

  const updateTopic = (
    id: string,
    field: "name" | "description",
    value: string
  ) => {
    setTopics((prev) =>
      prev.map((topic) =>
        topic.id === id ? { ...topic, [field]: value } : topic
      )
    );

    if (errors.topics) {
      setErrors((prev) => ({ ...prev, topics: "" }));
    }
  };

  const handleCloseModal = () => {
    if (!loadingCreateExam) {
      closeCreateExamModal();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleCloseModal}
    >
      <div
        className="bg-white rounded-xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {loadingCreateExam && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-xl z-10">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-slate-600 font-medium">Criando avaliação...</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-blue-600 p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                <ClipboardList className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Nova Avaliação</h2>
                <p className="text-blue-100 text-sm mt-1">
                  Preencha os dados para criar uma nova avaliação
                </p>
              </div>
            </div>
            <button
              onClick={handleCloseModal}
              disabled={loadingCreateExam}
              className="text-white/80 hover:text-white transition-colors p-1 disabled:opacity-50"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide border-b pb-2">
                Informações Básicas
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Nome da Avaliação *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={loadingCreateExam}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                      errors.name ? "border-red-500" : "border-slate-300"
                    }`}
                    placeholder="Ex: Prova Final - Módulo 3"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Professor Responsável *
                  </label>
                  <select
                    name="teacherId"
                    value={formData.teacherId}
                    onChange={handleChange}
                    disabled={loadingCreateExam || loadingTeachers}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
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
                    <p className="text-red-500 text-xs mt-1">
                      {errors.teacherId}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Tipo de Avaliação e Seleção */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide border-b pb-2">
                Tipo de Avaliação
              </h3>

              <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
                {/* Radio Buttons */}
                <div className="flex gap-3">
                  <label
                    className={`flex items-center gap-2 px-4 py-2.5 border-2 rounded-lg cursor-pointer transition-all whitespace-nowrap ${
                      formData.evaluationType === "class"
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-300 hover:border-slate-400"
                    } ${
                      loadingCreateExam ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="evaluationType"
                      value="class"
                      checked={formData.evaluationType === "class"}
                      onChange={() => handleEvaluationTypeChange("class")}
                      disabled={loadingCreateExam}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span
                      className={`font-medium text-sm ${
                        formData.evaluationType === "class"
                          ? "text-blue-700"
                          : "text-slate-700"
                      }`}
                    >
                      Turma
                    </span>
                  </label>

                  <label
                    className={`flex items-center gap-2 px-4 py-2.5 border-2 rounded-lg cursor-pointer transition-all whitespace-nowrap ${
                      formData.evaluationType === "student"
                        ? "border-red-500 bg-red-50"
                        : "border-slate-300 hover:border-slate-400"
                    } ${
                      loadingCreateExam ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="evaluationType"
                      value="student"
                      checked={formData.evaluationType === "student"}
                      onChange={() => handleEvaluationTypeChange("student")}
                      disabled={loadingCreateExam}
                      className="w-4 h-4 text-red-600"
                    />
                    <span
                      className={`font-medium text-sm ${
                        formData.evaluationType === "student"
                          ? "text-red-700"
                          : "text-slate-700"
                      }`}
                    >
                      Aluno
                    </span>
                  </label>
                </div>

                {/* Select */}
                <div className="flex-1 w-full">
                  {formData.evaluationType === "class" ? (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Selecione a Turma *
                      </label>
                      <select
                        name="classId"
                        value={formData.classId}
                        onChange={handleChange}
                        disabled={loadingCreateExam || loadingClasses}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                          errors.classId ? "border-red-500" : "border-slate-300"
                        }`}
                      >
                        <option value="">Selecione uma turma</option>
                        {classes.map((classItem) => (
                          <option key={classItem.id} value={classItem.id}>
                            {classItem.name} - {classItem.level} (
                            {classItem.language.name})
                          </option>
                        ))}
                      </select>
                      {errors.classId && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.classId}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Selecione a Matrícula *
                      </label>
                      <select
                        name="enrollmentId"
                        value={formData.enrollmentId}
                        onChange={handleChange}
                        disabled={loadingCreateExam || loadingEnrollments}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                          errors.enrollmentId
                            ? "border-red-500"
                            : "border-slate-300"
                        }`}
                      >
                        <option value="">Selecione uma matrícula</option>
                        {enrollments.map((enrollment) => (
                          <option key={enrollment.id} value={enrollment.id}>
                            {enrollment.student.name} - {enrollment.class.name}{" "}
                            ({enrollment.class.level})
                          </option>
                        ))}
                      </select>
                      {errors.enrollmentId && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.enrollmentId}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tópicos */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                  Critérios de Avaliação *
                </h3>
                <button
                  type="button"
                  onClick={addTopic}
                  disabled={loadingCreateExam}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-medium"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Adicionar Tópico
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[280px] overflow-y-auto pr-2">
                {topics.map((topic, index) => (
                  <div
                    key={topic.id}
                    className="bg-slate-50 rounded-lg border border-slate-200 p-3"
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                            <span className="text-blue-700 font-semibold text-xs">
                              {index + 1}
                            </span>
                          </div>
                          <input
                            type="text"
                            value={topic.name}
                            onChange={(e) =>
                              updateTopic(topic.id, "name", e.target.value)
                            }
                            disabled={loadingCreateExam}
                            className="flex-1 px-2 py-1.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            placeholder={`Tópico ${index + 1}`}
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeTopic(topic.id)}
                        disabled={loadingCreateExam || topics.length === 1}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Remover tópico"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {errors.topics && (
                <p className="text-red-500 text-xs mt-2">{errors.topics}</p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 p-4 bg-slate-50 flex gap-3">
            <button
              type="button"
              onClick={handleCloseModal}
              disabled={loadingCreateExam}
              className="flex-1 px-4 py-2.5 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loadingCreateExam}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              {loadingCreateExam ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Criando...
                </>
              ) : (
                "Criar Avaliação"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
