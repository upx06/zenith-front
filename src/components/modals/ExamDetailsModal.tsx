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

interface IExamDetailsModal {
  exam: IExam;
  closeExamDetailsModal: () => void;
}

const GRADE_CONFIG = {
  1: {
    label: "Insuficiente",
    color: "red",
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    borderColor: "border-red-200",
  },
  2: {
    label: "Regular",
    color: "yellow",
    bgColor: "bg-yellow-50",
    textColor: "text-yellow-700",
    borderColor: "border-yellow-200",
  },
  3: {
    label: "Bom",
    color: "green",
    bgColor: "bg-green-50",
    textColor: "text-green-700",
    borderColor: "border-green-200",
  },
};

export const ExamDetailsModal = ({
  exam,
  closeExamDetailsModal,
}: IExamDetailsModal) => {
  const isClassEvaluation = !!exam.class;
  const hasResults = exam.results && exam.results.length > 0;

  // Pegar lista de alunos com seus resultados
  const getStudentResults = () => {
    if (!isClassEvaluation || !exam.class?.enrollments) return [];

    return exam.class.enrollments.map((enrollment) => {
      const studentResult = exam.results?.find(
        (result) => result.enrollmentId === enrollment.id
      );

      return {
        enrollment,
        result: studentResult,
      };
    });
  };

  const studentResults = isClassEvaluation ? getStudentResults() : [];

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={closeExamDetailsModal}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
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
                      Turma Completa
                    </div>
                  ) : (
                    <div className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium flex items-center gap-1">
                      <User className="w-3 h-3" />
                      Aluno Específico
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
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="flex items-center gap-3">
                  {isClassEvaluation ? (
                    <Users className="w-5 h-5 text-blue-600 shrink-0" />
                  ) : (
                    <User className="w-5 h-5 text-blue-600 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="text-xs text-slate-500 font-medium uppercase tracking-wide block">
                      {isClassEvaluation ? "Turma" : "Aluno"}
                    </span>
                    <span className="font-semibold text-slate-800 truncate block">
                      {isClassEvaluation
                        ? `${exam.class?.name} - ${exam.class?.level}`
                        : exam.enrollment?.student.name}
                    </span>
                  </div>
                </div>
              </div>

              {/* Critérios */}
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-blue-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs text-slate-500 font-medium uppercase tracking-wide block">
                      Critérios de Avaliação
                    </span>
                    <span className="font-semibold text-slate-800">
                      {exam.topics?.length || 0} tópico
                      {exam.topics?.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tópicos */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide flex items-center gap-2">
                <ClipboardList className="w-4 h-4" />
                Tópicos Avaliados
              </h3>

              {exam.topics?.length === 0 ? (
                <div className="bg-slate-50 rounded-lg p-6 text-center border border-slate-200">
                  <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-600 text-sm">
                    Nenhum tópico cadastrado
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {exam.topics?.map((topic, index) => (
                    <div
                      key={topic.id}
                      className="bg-white border border-slate-200 rounded-lg p-3 hover:shadow-sm hover:border-blue-300 transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                          <span className="text-blue-700 font-semibold text-xs">
                            {index + 1}
                          </span>
                        </div>
                        <span className="font-medium text-slate-800 text-sm truncate">
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
              <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide flex items-center gap-2">
                <Award className="w-4 h-4" />
                Resultados
                {hasResults && (
                  <span className="text-xs font-normal text-slate-500 ml-1">
                    ({exam.results.length} aluno
                    {exam.results.length !== 1 ? "s" : ""} avaliado
                    {exam.results.length !== 1 ? "s" : ""})
                  </span>
                )}
              </h3>

              {!hasResults ? (
                <div className="bg-slate-50 rounded-lg p-8 text-center border border-slate-200">
                  <Award className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-600 font-medium">
                    Nenhum resultado disponível
                  </p>
                  <p className="text-slate-500 text-sm mt-1">
                    Esta avaliação ainda não possui resultados lançados
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Avaliação Individual */}
                  {!isClassEvaluation && exam.results?.[0] && (
                    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                        <div className="flex items-center gap-3">
                          <User className="w-5 h-5 text-blue-600" />
                          <div>
                            <h4 className="font-semibold text-slate-800">
                              {exam.enrollment?.student.name}
                            </h4>
                            <p className="text-xs text-slate-500">
                              {exam.enrollment?.student.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 space-y-3">
                        {exam.results[0].scores?.map((scoreItem) => {
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
                                <span className="font-medium text-slate-800 text-sm">
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
                                <div className="mt-2 pt-2 border-t border-slate-200">
                                  <p className="text-xs text-slate-600">
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
                      {studentResults.map(({ enrollment, result }) => (
                        <div
                          key={enrollment.id}
                          className="bg-white border border-slate-200 rounded-lg overflow-hidden"
                        >
                          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <User className="w-5 h-5 text-blue-600" />
                                <div>
                                  <h4 className="font-semibold text-slate-800">
                                    {enrollment.student.name}
                                  </h4>
                                  <p className="text-xs text-slate-500">
                                    {enrollment.student.email}
                                  </p>
                                </div>
                              </div>
                              {!result && (
                                <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded">
                                  Não avaliado
                                </span>
                              )}
                            </div>
                          </div>

                          {result &&
                            result.scores &&
                            result.scores.length > 0 && (
                              <div className="p-4 space-y-3">
                                {result.scores.map((scoreItem) => {
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
                                        <span className="font-medium text-slate-800 text-sm">
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
                                        <div className="mt-2 pt-2 border-t border-slate-200">
                                          <p className="text-xs text-slate-600">
                                            {scoreItem.feedback}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                          {result &&
                            (!result.scores || result.scores.length === 0) && (
                              <div className="p-4 text-center text-sm text-slate-500">
                                Nenhuma nota lançada
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
