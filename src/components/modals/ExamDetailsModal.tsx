import {
  X,
  ClipboardList,
  GraduationCap,
  Users,
  User,
  BookOpen,
  Award,
} from "lucide-react";
import type { IExam } from "../../interfaces/IExam";
import { useTranslation } from "react-i18next";

interface IExamDetailsModal {
  exam: IExam;
  closeExamDetailsModal: () => void;
}

const GRADE_CONFIG = {
  1: {
    label: "Insuficiente",
    color: "red",
    bgColor: "bg-red-50 dark:bg-red-950/30",
    textColor: "text-red-700 dark:text-red-400",
    borderColor: "border-red-200 dark:border-red-900",
  },
  2: {
    label: "Regular",
    color: "yellow",
    bgColor: "bg-yellow-50 dark:bg-yellow-950/30",
    textColor: "text-yellow-700 dark:text-yellow-400",
    borderColor: "border-yellow-200 dark:border-yellow-900",
  },
  3: {
    label: "Bom",
    color: "green",
    bgColor: "bg-green-50 dark:bg-green-950/30",
    textColor: "text-green-700 dark:text-green-400",
    borderColor: "border-green-200 dark:border-green-900",
  },
};

export const ExamDetailsModal = ({
  exam,
  closeExamDetailsModal,
}: IExamDetailsModal) => {
  const { t } = useTranslation();

  const isClassEvaluation = !!exam.class;
  const hasResults = exam.scores && exam.scores.length > 0;

  // Pegar lista de alunos com seus scores
  const getStudentResults = () => {
    if (!isClassEvaluation || !exam.class?.enrollments) return [];

    return exam.class.enrollments.map((enrollment) => {
      const studentScores = exam.scores?.filter(
        (score) => score.enrollmentId === enrollment.id
      );

      return {
        enrollment,
        scores: studentScores || [],
      };
    });
  };

  const studentResults = isClassEvaluation ? getStudentResults() : [];

  // Para avaliação individual, pegar scores do aluno
  const individualScores =
    !isClassEvaluation && exam.enrollment
      ? exam.scores?.filter(
          (score) => score.enrollmentId === exam.enrollment.id
        ) || []
      : [];

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={closeExamDetailsModal}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                <ClipboardList className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{exam.name}</h2>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-2 text-blue-100">
                    <GraduationCap className="w-4 h-4" />
                    <span className="text-sm">{exam.teacher?.name}</span>
                  </div>
                  {isClassEvaluation ? (
                    <div className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {t("common.common.class")}
                    </div>
                  ) : (
                    <div className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {t("common.common.student")}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={closeExamDetailsModal}
              className="text-white/80 hover:text-white transition-colors p-1"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Informações Básicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Turma/Aluno */}
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  {isClassEvaluation ? (
                    <Users className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                  ) : (
                    <User className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide block">
                      {isClassEvaluation
                        ? t("common.common.class")
                        : t("common.common.student")}
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-white truncate block">
                      {isClassEvaluation
                        ? `${exam.class?.name} - ${exam.class?.level}`
                        : exam.enrollment?.student.name}
                    </span>
                  </div>
                </div>
              </div>

              {/* Critérios */}
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide block">
                      {t("exam.examDetailsModal.criteria")}
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-white">
                      {exam.topics?.length || 0}{" "}
                      {t("common.common.topic").toLowerCase()}
                      {exam.topics?.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tópicos */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 uppercase tracking-wide flex items-center gap-2">
                <ClipboardList className="w-4 h-4" />
                {t("exam.examDetailsModal.criteira")}
              </h3>

              {exam.topics?.length === 0 ? (
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6 text-center border border-slate-200 dark:border-slate-700">
                  <ClipboardList className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-600 dark:text-slate-300 text-sm">
                    {t("exam.examDetailsModal.evaluatedTopic")}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {exam.topics?.map((topic, index) => (
                    <div
                      key={topic.id}
                      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 hover:shadow-sm hover:border-blue-300 dark:hover:border-blue-400 transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center shrink-0">
                          <span className="text-blue-700 dark:text-blue-300 font-semibold text-xs">
                            {index + 1}
                          </span>
                        </div>
                        <span className="font-medium text-slate-800 dark:text-white text-sm truncate">
                          {topic.name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Resultados */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 uppercase tracking-wide flex items-center gap-2">
                <Award className="w-4 h-4" />
                {t("common.common.results")}
                {/* {hasResults && isClassEvaluation && (
                  <span className="text-xs font-normal text-slate-500 dark:text-slate-400 ml-1">
                    (
                    {studentResults.filter((sr) => sr.scores.length > 0).length}{" "}
                    aluno
                    {studentResults.filter((sr) => sr.scores.length > 0)
                      .length !== 1
                      ? "s"
                      : ""}{" "}
                    avaliado
                    {studentResults.filter((sr) => sr.scores.length > 0)
                      .length !== 1
                      ? "s"
                      : ""}
                    )
                  </span>
                )} */}
              </h3>

              {!hasResults ? (
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-8 text-center border border-slate-200 dark:border-slate-700">
                  <Award className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-600 dark:text-slate-300 font-medium">
                    {t("exam.examDetailsModal.noResult")}
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                    {t("exam.examDetailsModal.noResultsYet")}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Avaliação Individual */}
                  {!isClassEvaluation && individualScores.length > 0 && (
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                      <div className="bg-slate-50 dark:bg-slate-800 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                          <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          <div>
                            <h4 className="font-semibold text-slate-800 dark:text-white">
                              {exam.enrollment?.student.name}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {exam.enrollment?.student.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 space-y-3">
                        {individualScores.map((scoreItem) => {
                          const gradeConfig =
                            GRADE_CONFIG[
                              scoreItem.score as keyof typeof GRADE_CONFIG
                            ];

                          return (
                            <div
                              key={scoreItem.id}
                              className={`${gradeConfig.bgColor} ${gradeConfig.borderColor} border rounded-lg p-3`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-slate-800 dark:text-white text-sm">
                                  {scoreItem.topic.name}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`${gradeConfig.textColor} text-lg font-bold`}
                                  >
                                    {scoreItem.score}
                                  </span>
                                  <span
                                    className={`text-xs ${gradeConfig.textColor} font-medium`}
                                  >
                                    {gradeConfig.label}
                                  </span>
                                </div>
                              </div>
                              {scoreItem.feedback && (
                                <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                                  <p className="text-xs text-slate-600 dark:text-slate-300">
                                    {scoreItem.feedback}
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Avaliação de Turma */}
                  {isClassEvaluation && studentResults.length > 0 && (
                    <div className="space-y-3">
                      {studentResults.map(({ enrollment, scores }) => (
                        <div
                          key={enrollment.id}
                          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden"
                        >
                          <div className="bg-slate-50 dark:bg-slate-800 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                <div>
                                  <h4 className="font-semibold text-slate-800 dark:text-white">
                                    {enrollment.student.name}
                                  </h4>
                                  <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {enrollment.student.email}
                                  </p>
                                </div>
                              </div>
                              {scores.length === 0 && (
                                <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium rounded">
                                  {t("exam.examDetailsModal.notEvaluated")}
                                </span>
                              )}
                            </div>
                          </div>

                          {scores.length > 0 && (
                            <div className="p-4 space-y-3">
                              {scores.map((scoreItem) => {
                                const gradeConfig =
                                  GRADE_CONFIG[
                                    scoreItem.score as keyof typeof GRADE_CONFIG
                                  ];

                                return (
                                  <div
                                    key={scoreItem.id}
                                    className={`${gradeConfig.bgColor} ${gradeConfig.borderColor} border rounded-lg p-3`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium text-slate-800 dark:text-white text-sm">
                                        {scoreItem.topic.name}
                                      </span>
                                      <div className="flex items-center gap-2">
                                        <span
                                          className={`${gradeConfig.textColor} text-lg font-bold`}
                                        >
                                          {scoreItem.score}
                                        </span>
                                        <span
                                          className={`text-xs ${gradeConfig.textColor} font-medium`}
                                        >
                                          {gradeConfig.label}
                                        </span>
                                      </div>
                                    </div>
                                    {scoreItem.feedback && (
                                      <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                                        <p className="text-xs text-slate-600 dark:text-slate-300">
                                          {scoreItem.feedback}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
