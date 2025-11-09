import { useEffect, useState, useCallback } from "react";
import { X, Award, BookOpen, User, Save, Loader2, AlertCircle } from "lucide-react";
import { UPDATE_EXAM } from "../../graphql/mutations/update/UpdateExam";
import type { IExam } from "../../interfaces/IExam";
import { useMutation } from "@apollo/client/react";

interface IGradesControlModal {
  exam: IExam;
  closeGradesControlModal: () => void;
  refetchExams: () => void;
}

type GradeState = Record<string, Record<string, number | null>>;

const GRADE_OPTIONS = [
  { value: 1, label: "Insuficiente", color: "red" },
  { value: 2, label: "Regular", color: "yellow" },
  { value: 3, label: "Bom", color: "green" },
] as const;

export const GradesControlModal = ({
  exam,
  closeGradesControlModal,
  refetchExams,
}: IGradesControlModal) => {
  const loadExistingGrades = useCallback((): GradeState => {
    const existingGrades: GradeState = {};

    // Percorre os results do exam
    exam.results?.forEach((result) => {
      if (!result?.enrollmentId) return;

      if (!existingGrades[result.enrollmentId]) {
        existingGrades[result.enrollmentId] = {};
      }

      // Percorre os scores de cada result
      result.scores?.forEach((score) => {
        if (
          score?.topic?.id &&
          score?.score !== undefined &&
          score?.score !== null
        ) {
          existingGrades[result.enrollmentId][score.topic.id] = score.score;
        }
      });
    });
    return existingGrades;
  }, [exam.results]);

  const [grades, setGrades] = useState<GradeState>(() => {
    const existingGrades: GradeState = {};

    exam.results?.forEach((result) => {
      if (!result?.enrollmentId) return;

      if (!existingGrades[result.enrollmentId]) {
        existingGrades[result.enrollmentId] = {};
      }

      result.scores?.forEach((score) => {
        if (
          score?.topic?.id &&
          score?.score !== undefined &&
          score?.score !== null
        ) {
          existingGrades[result.enrollmentId][score.topic.id] = score.score;
        }
      });
    });

    return existingGrades;
  });

  const [updateExam, { loading: loadingExam, error: errorExam }] =
    useMutation(UPDATE_EXAM);

  useEffect(() => {
    const newGrades = loadExistingGrades();
    setGrades(newGrades);
  }, [loadExistingGrades]);

  const isClassExam = !!exam.class;

  const enrollments = isClassExam
    ? exam.class?.enrollments || []
    : exam.enrollment
    ? [exam.enrollment]
    : [];

  const topics = exam.topics || [];

  const handleGradeChange = (
    enrollmentId: string,
    topicId: string,
    score: number
  ) => {
    setGrades((prev) => {
      const currentGrade = prev[enrollmentId]?.[topicId];

      if (currentGrade === score) {
        return {
          ...prev,
          [enrollmentId]: {
            ...prev[enrollmentId],
            [topicId]: null,
          },
        };
      }

      return {
        ...prev,
        [enrollmentId]: {
          ...prev[enrollmentId],
          [topicId]: score,
        },
      };
    });
  };

  const handleSave = async () => {
    try {
      // Agrupa scores por enrollment
      const resultsByEnrollment: Record<
        string,
        { topicId: string; score: number }[]
      > = {};

      Object.entries(grades).forEach(([enrollmentId, topicGrades]) => {
        Object.entries(topicGrades).forEach(([topicId, score]) => {
          if (score !== null) {
            if (!resultsByEnrollment[enrollmentId]) {
              resultsByEnrollment[enrollmentId] = [];
            }
            resultsByEnrollment[enrollmentId].push({ topicId, score });
          }
        });
      });

      // Monta o input final agrupando scores por enrollment
      const finalInput = {
        id: exam.id,
        input: {
          results: Object.entries(resultsByEnrollment).map(
            ([enrollmentId, scores]) => ({
              enrollmentId,
              totalScore: 10, // ou calcule baseado nos scores
              scores: scores.map(({ topicId, score }) => ({
                topicId,
                score,
                feedback: "",
              })),
            })
          ),
        },
      };

      await updateExam({
        variables: finalInput,
      });

      refetchExams();
      closeGradesControlModal();
    } catch (error) {
      console.error("Erro ao salvar notas:", error);
    }
  };

  const assignedGrades = Object.values(grades).reduce(
    (acc, topicGrades) =>
      acc + Object.values(topicGrades).filter((grade) => grade !== null).length,
    0
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                <Award className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Controle de Notas</h2>
                <p className="text-blue-100 mt-1">{exam.name}</p>
                <p className="text-blue-200 text-sm mt-1">
                  {isClassExam
                    ? `${exam.class?.name} - ${exam.class?.level}`
                    : `Aluno: ${exam.enrollment?.student.name}`}
                </p>
              </div>
            </div>
            <button
              onClick={closeGradesControlModal}
              disabled={loadingExam}
              className="text-white/80 hover:text-white transition-colors p-1 disabled:opacity-50"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {enrollments.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 font-medium">
                Nenhum aluno matriculado
              </p>
              <p className="text-slate-500 text-sm mt-1">
                Esta turma não possui alunos matriculados
              </p>
            </div>
          ) : topics.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 font-medium">
                Nenhum tópico cadastrado
              </p>
              <p className="text-slate-500 text-sm mt-1">
                Esta avaliação não possui tópicos definidos
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {enrollments.map((enrollment) => {
                const studentGrades = grades[enrollment.id] || {};
                const studentAssignedGrades = Object.values(
                  studentGrades
                ).filter((grade) => grade !== null).length;

                return (
                  <div
                    key={enrollment.id}
                    className="bg-white border border-slate-200 rounded-lg overflow-hidden"
                  >
                    {/* Student Header */}
                    <div className="bg-slate-50 px-5 py-4 border-b border-slate-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-800">
                              {enrollment.student.name}
                            </h3>
                            <p className="text-sm text-slate-600">
                              {enrollment.student.email}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-slate-600">
                            {studentAssignedGrades} de {topics.length}
                          </div>
                          <div className="text-xs text-slate-500">
                            tópicos avaliados
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Topics */}
                    <div className="p-5 space-y-4">
                      {topics.map((topic, index) => {
                        const currentGrade = studentGrades[topic.id];

                        return (
                          <div
                            key={topic.id}
                            className="bg-slate-50 rounded-lg p-4"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                                  <span className="text-blue-700 font-semibold text-sm">
                                    {index + 1}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-slate-800 truncate">
                                    {topic.name}
                                  </div>
                                </div>
                              </div>

                              {/* Grade Buttons */}
                              <div className="flex gap-2">
                                {GRADE_OPTIONS.map((option) => (
                                  <button
                                    key={option.value}
                                    onClick={() =>
                                      handleGradeChange(
                                        enrollment.id,
                                        topic.id,
                                        option.value
                                      )
                                    }
                                    disabled={loadingExam}
                                    className={`
                                      px-3 py-2 rounded-lg text-sm font-medium transition-all
                                      ${
                                        currentGrade === option.value
                                          ? option.color === "red"
                                            ? "bg-red-100 text-red-700 border-2 border-red-500"
                                            : option.color === "yellow"
                                            ? "bg-yellow-100 text-yellow-700 border-2 border-yellow-500"
                                            : "bg-green-100 text-green-700 border-2 border-green-500"
                                          : "bg-white text-slate-600 border-2 border-slate-200 hover:border-slate-400"
                                      }
                                      disabled:opacity-50 disabled:cursor-not-allowed
                                    `}
                                  >
                                    {option.value}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 p-6 bg-slate-50">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 text-sm text-slate-600">
              {assignedGrades > 0 && (
                <span>Você pode salvar mesmo sem completar todas as notas</span>
              )}
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                onClick={closeGradesControlModal}
                disabled={loadingExam}
                className="flex-1 sm:flex-none px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={loadingExam || assignedGrades === 0}
                className="flex-1 sm:flex-none px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loadingExam ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Salvar Notas
                  </>
                )}
              </button>
            </div>
          </div>
          {assignedGrades === 0 && enrollments.length > 0 && (
            <p className="text-xs text-amber-600 mt-2 text-center sm:text-right">
              Atribua pelo menos uma nota antes de salvar
            </p>
          )}
          {errorExam && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900">
                  Erro ao salvar notas
                </p>
                <p className="text-xs text-red-700 mt-1">
                  {errorExam.message || "Ocorreu um erro ao tentar salvar as notas. Por favor, tente novamente."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
