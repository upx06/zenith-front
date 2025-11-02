import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { X, Loader2, Plus, Trash2, Users, User } from "lucide-react";
import toast from "react-hot-toast";

import { LIST_CLASSES } from "../../../graphql/queries/ListClasses";
import { LIST_ENROLLMENTS } from "../../../graphql/queries/ListEnrollments";
import { LIST_TEACHERS } from "../../../graphql/queries/ListTeachers";

import type { IListClasses } from "../../../interfaces/IListClasses";
import type { IListEnrollments } from "../../../interfaces/IListEnrollments";
import type { IListTeachers } from "../../../interfaces/IListTeachers";

import { CREATE_EXAM } from "../../../graphql/mutations/CreateExam";

interface ICreateEvaluationModal {
  closeCreateEvaluationModal: () => void;
  refetchEvaluations: () => void;
}

interface ITopic {
  id: string;
  name: string;
  description: string;
}

export const CreateEvaluationModal = ({
  closeCreateEvaluationModal,
  refetchEvaluations,
}: ICreateEvaluationModal) => {
  const [formData, setFormData] = useState({
    name: "",
    teacherId: "",
    evaluationType: "class" as "class" | "student",
    classId: "",
    enrollmentId: "",
  });

  const [topics, setTopics] = useState<ITopic[]>([
    { id: crypto.randomUUID(), name: "", description: "" },
  ]);

  const [errors, setErrors] = useState({
    name: "",
    teacherId: "",
    classId: "",
    enrollmentId: "",
    topics: "",
  });

  // Buscar turmas
  const { data: classesData, loading: loadingClasses } = useQuery<IListClasses>(
    LIST_CLASSES,
    {
      fetchPolicy: "cache-and-network",
    }
  );

  // Buscar enrollments
  const { data: enrollmentsData, loading: loadingEnrollments } =
    useQuery<IListEnrollments>(LIST_ENROLLMENTS, {
      fetchPolicy: "cache-and-network",
    });

  // Buscar professores
  const { data: teachersData, loading: loadingTeachers } =
    useQuery<IListTeachers>(LIST_TEACHERS, {
      fetchPolicy: "cache-and-network",
    });

  const [createExam, { loading: loadingCreateExam, error: errorCreateExam }] =
    useMutation(CREATE_EXAM);

  const classes = classesData?.listClasses?.results || [];
  const enrollments = enrollmentsData?.listEnrollments?.results || [];
  const teachers = teachersData?.listTeachers?.results || [];

  // Monitorar erros da mutation
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

    // Validar tópicos
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
          classId: formData.evaluationType === "class" ? formData.classId : null,
          enrollmentId: formData.evaluationType === "student" ? formData.enrollmentId : null,
          teacherId: formData.teacherId,
          topics: topics.map((topic) => ({
            name: topic.name,
          })),
        },
      },
    });

    if (result.data) {
      toast.success("Avaliação criada com sucesso!");
      refetchEvaluations();
      closeCreateEvaluationModal();
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
    setTopics((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: "", description: "" },
    ]);
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

    // Limpar erro de tópicos ao editar
    if (errors.topics) {
      setErrors((prev) => ({ ...prev, topics: "" }));
    }
  };

  const handleCloseModal = () => {
    if (!loadingCreateExam) {
      closeCreateEvaluationModal();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleCloseModal}
    >
      <div
        className="bg-white rounded-lg p-4 md:p-6 w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {loadingCreateExam && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-lg z-10">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-slate-600 font-medium">Criando avaliação...</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-800">
            Nova Avaliação
          </h2>
          <button
            onClick={handleCloseModal}
            disabled={loadingCreateExam}
            className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Layout em 2 colunas: Info Básica + Tipo | Tópicos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:items-start">
            {/* Coluna Esquerda: Informações Básicas + Tipo de Avaliação */}
            <div className="space-y-4">
              {/* Informações Básicas */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-700 border-b pb-2">
                  Informações Básicas
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
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
                      placeholder="Ex: Prova de Final de Módulo"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
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

              {/* Tipo de Avaliação */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-700 border-b pb-2">
                  Tipo de Avaliação
                </h3>

                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => handleEvaluationTypeChange("class")}
                    disabled={loadingCreateExam}
                    className={`w-full p-4 border-2 rounded-lg transition-all ${
                      formData.evaluationType === "class"
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-300 hover:border-slate-400"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Users
                        className={`w-5 h-5 ${
                          formData.evaluationType === "class"
                            ? "text-blue-600"
                            : "text-slate-600"
                        }`}
                      />
                      <span
                        className={`font-medium ${
                          formData.evaluationType === "class"
                            ? "text-blue-600"
                            : "text-slate-600"
                        }`}
                      >
                        Turma Completa
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 text-center">
                      Todos os alunos da turma farão a avaliação
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleEvaluationTypeChange("student")}
                    disabled={loadingCreateExam}
                    className={`w-full p-4 border-2 rounded-lg transition-all ${
                      formData.evaluationType === "student"
                        ? "border-red-500 bg-red-50"
                        : "border-slate-300 hover:border-slate-400"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <User
                        className={`w-5 h-5 ${
                          formData.evaluationType === "student"
                            ? "text-red-600"
                            : "text-slate-600"
                        }`}
                      />
                      <span
                        className={`font-medium ${
                          formData.evaluationType === "student"
                            ? "text-red-600"
                            : "text-slate-600"
                        }`}
                      >
                        Aluno Específico
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 text-center">
                      Avaliação dedicada a uma matrícula
                    </p>
                  </button>
                </div>

                {/* Select condicional */}
                {formData.evaluationType === "class" && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
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
                )}

                {formData.evaluationType === "student" && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
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
                          {enrollment.student.name} - {enrollment.class.name} (
                          {enrollment.class.level})
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

            {/* Coluna Direita: Tópicos de Avaliação */}
            <div className="flex flex-col space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-sm font-semibold text-slate-700">
                  Critérios de Avaliação
                </h3>
                <button
                  type="button"
                  onClick={addTopic}
                  disabled={loadingCreateExam}
                  className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Tópico
                </button>
              </div>

              <div className="space-y-3 h-[450px] overflow-y-auto pr-2">
                {topics.map((topic, index) => (
                  <div
                    key={topic.id}
                    className="p-4 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Tópico {index + 1} *
                          </label>
                          <input
                            type="text"
                            value={topic.name}
                            onChange={(e) =>
                              updateTopic(topic.id, "name", e.target.value)
                            }
                            disabled={loadingCreateExam}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            placeholder="Ex: Gramática, Pronúncia, Vocabulário"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeTopic(topic.id)}
                        disabled={loadingCreateExam || topics.length === 1}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Remover tópico"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {errors.topics && (
                <p className="text-red-500 text-xs">{errors.topics}</p>
              )}
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={handleCloseModal}
              disabled={loadingCreateExam}
              className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm md:text-base"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loadingCreateExam}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors text-sm md:text-base flex items-center justify-center gap-2"
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
