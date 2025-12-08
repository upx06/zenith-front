import { useState } from "react";
import {
  X,
  Award,
  BookOpen,
  User,
  // Save,
  Loader2,
  AlertCircle,
  MessageSquare,
} from "lucide-react";
import { UPDATE_SCORE } from "../../graphql/mutations/update/UpdateScore";
import type { IExam } from "../../interfaces/IExam";
import { useMutation } from "@apollo/client/react";
import { useTranslation } from "react-i18next";

interface IGradesControlModal {
  exam: IExam;
  closeGradesControlModal: () => void;
  refetchExams: () => void;
}

type GradeState = Record<string, Record<string, number | null>>;
type FeedbackState = Record<string, Record<string, string>>;
type ShowFeedbackState = Record<string, Record<string, boolean>>;

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
  const { t } = useTranslation();

  const [grades, setGrades] = useState<GradeState>(() => {
    const existingGrades: GradeState = {};

    // Percorre os scores do exam
    exam.scores?.forEach((score) => {
      if (!score?.enrollmentId || !score?.topic?.id) return;

      if (!existingGrades[score.enrollmentId]) {
        existingGrades[score.enrollmentId] = {};
      }

      if (score?.score !== undefined && score?.score !== null) {
        existingGrades[score.enrollmentId][score.topic.id] = score.score;
      }
    });
    return existingGrades;
  });

  const [feedbacks, setFeedbacks] = useState<FeedbackState>(() => {
    const existingFeedbacks: FeedbackState = {};

    // Percorre os scores do exam
    exam.scores?.forEach((score) => {
      if (!score?.enrollmentId || !score?.topic?.id) return;

      if (!existingFeedbacks[score.enrollmentId]) {
        existingFeedbacks[score.enrollmentId] = {};
      }

      if (score?.feedback) {
        existingFeedbacks[score.enrollmentId][score.topic.id] = score.feedback;
      }
    });
    return existingFeedbacks;
  });

  const [showFeedback, setShowFeedback] = useState<ShowFeedbackState>({});

  const [updateScore, { loading: loadingExam, error: errorExam }] =
    useMutation(UPDATE_SCORE);

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
        // Ao remover a nota, também limpa o feedback e esconde o campo
        setFeedbacks((prevFeedbacks) => ({
          ...prevFeedbacks,
          [enrollmentId]: {
            ...prevFeedbacks[enrollmentId],
            [topicId]: "",
          },
        }));

        setShowFeedback((prevShow) => ({
          ...prevShow,
          [enrollmentId]: {
            ...prevShow[enrollmentId],
            [topicId]: false,
          },
        }));

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

  const toggleFeedback = (enrollmentId: string, topicId: string) => {
    setShowFeedback((prev) => ({
      ...prev,
      [enrollmentId]: {
        ...prev[enrollmentId],
        [topicId]: !prev[enrollmentId]?.[topicId],
      },
    }));
  };

  const handleFeedbackChange = (
    enrollmentId: string,
    topicId: string,
    feedback: string
  ) => {
    setFeedbacks((prev) => ({
      ...prev,
      [enrollmentId]: {
        ...prev[enrollmentId],
        [topicId]: feedback,
      },
    }));
  };

  const handleSave = async () => {
    try {
      // Agrupa scores por enrollment (apenas os que têm nota)
      const resultsByEnrollment: Record<
        string,
        { topicId: string; score: number; feedback: string }[]
      > = {};

      Object.entries(grades).forEach(([enrollmentId, topicGrades]) => {
        Object.entries(topicGrades).forEach(([topicId, score]) => {
          // Apenas envia scores que têm valor (não null)
          // Se não tem score, não envia nada (será removido do banco)
          if (score !== null) {
            if (!resultsByEnrollment[enrollmentId]) {
              resultsByEnrollment[enrollmentId] = [];
            }

            // Pega o feedback (ou "" se vazio)
            const feedback = feedbacks[enrollmentId]?.[topicId] || "";

            resultsByEnrollment[enrollmentId].push({
              topicId,
              score,
              feedback,
            });
          }
        });
      });

      // Monta o input final agrupando scores por enrollment
      const finalInput = {
        id: exam.id,
        input: {
          scores: Object.entries(resultsByEnrollment)
            .map(([enrollmentId, scores]) =>
              scores.map(({ topicId, score, feedback }) => ({
                topicId,
                score,
                feedback,
                enrollmentId,
              }))
            )
            .flat(),
        },
      };

      await updateScore({
        variables: finalInput,
      });

      refetchExams();
      closeGradesControlModal();
    } catch (error) {
      console.error("Erro ao salvar notas:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 dark:bg-blue-500 p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 dark:bg-white/30 rounded-full flex items-center justify-center shrink-0">
                <Award className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {t("exam.gradesControlModal.title")}
                </h2>
                <p className="text-blue-100 dark:text-blue-200 mt-1">
                  {exam.name}
                </p>
                <p className="text-blue-200 dark:text-blue-300 text-sm mt-1">
                  {isClassExam
                    ? `${exam.class?.name} - ${exam.class?.level}`
                    : `${t("common.common.student")}: ${
                        exam.enrollment?.student.name
                      }`}
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
              <User className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-300 font-medium">
                {t("common.random.noStudentEnrolled")}
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                {t("common.random.classNoStudentEnrolled")}
              </p>
            </div>
          ) : topics.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-300 font-medium">
                {t("common.random.noTopic")}
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                {t("common.random.examNoTopic")}
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
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden"
                  >
                    {/* Student Header */}
                    <div className="bg-slate-50 dark:bg-slate-800 px-5 py-4 border-b border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div>
                            <h3 className="font-semibold text-slate-800 dark:text-white">
                              {enrollment.student.name}
                            </h3>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-slate-600 dark:text-slate-300">
                            {studentAssignedGrades} {t("common.random.of")}{" "}
                            {topics.length}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Topics */}
                    <div className="p-5 space-y-4">
                      {topics.map((topic) => {
                        const currentGrade = studentGrades[topic.id];
                        const currentFeedback =
                          feedbacks[enrollment.id]?.[topic.id] || "";
                        const isFeedbackVisible =
                          showFeedback[enrollment.id]?.[topic.id];

                        return (
                          <div
                            key={topic.id}
                            className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-slate-800 dark:text-white break-words">
                                    {topic.name}
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
                                            ? "bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 border-2 border-red-500 dark:border-red-600"
                                            : option.color === "yellow"
                                            ? "bg-yellow-100 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-400 border-2 border-yellow-500 dark:border-yellow-600"
                                            : "bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400 border-2 border-green-500 dark:border-green-600"
                                          : "bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-2 border-slate-200 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500"
                                      }
                                      disabled:opacity-50 disabled:cursor-not-allowed
                                    `}
                                    >
                                      {option.value}
                                    </button>
                                  ))}
                                </div>

                                {/* Feedback Toggle Button */}
                                <button
                                  onClick={() =>
                                    toggleFeedback(enrollment.id, topic.id)
                                  }
                                  disabled={loadingExam}
                                  className={`
                                    p-2 rounded-lg transition-all
                                    ${
                                      isFeedbackVisible
                                        ? "bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border-2 border-blue-500 dark:border-blue-600"
                                        : "bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-2 border-slate-200 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500"
                                    }
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                  `}
                                  title={t(
                                    "exam.gradesControlModal.addFeedback"
                                  )}
                                >
                                  <MessageSquare className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* Feedback Textarea */}
                            {isFeedbackVisible && (
                              <div className="mt-3 animate-in slide-in-from-top duration-200">
                                <textarea
                                  value={currentFeedback}
                                  onChange={(e) =>
                                    handleFeedbackChange(
                                      enrollment.id,
                                      topic.id,
                                      e.target.value
                                    )
                                  }
                                  disabled={loadingExam}
                                  placeholder={t(
                                    "common.formPlaceholders.selectFeedback"
                                  )}
                                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border-2 border-slate-200 dark:border-slate-600 rounded-lg focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none resize-none text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                  rows={3}
                                />
                              </div>
                            )}
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

        <div className="border-t border-slate-200 dark:border-slate-700 p-6 bg-slate-50 dark:bg-slate-800">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                onClick={closeGradesControlModal}
                disabled={loadingExam}
                className="flex-1 sm:flex-none px-6 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={loadingExam}
                className="flex-1 sm:flex-none px-6 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loadingExam ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    {/* <Save className="w-5 h-5" /> */}
                    Salvar
                  </>
                )}
              </button>
            </div>
          </div>
          {/* {assignedGrades === 0 && enrollments.length > 0 && (
            <p className="text-xs text-amber-600 mt-2 text-center sm:text-right">
              Atribua pelo menos uma nota antes de salvar
            </p>
          )} */}
          {errorExam && (
            <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900 dark:text-red-300">
                  Erro ao salvar notas
                </p>
                <p className="text-xs text-red-700 dark:text-red-400 mt-1">
                  {errorExam.message ||
                    "Ocorreu um erro ao tentar salvar as notas. Por favor, tente novamente."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
