import {
  X,
  ClipboardList,
  GraduationCap,
  Users,
  User,
  BookOpen,
  Award,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import type { IExam } from "../../interfaces/IExam";

interface IExamDetailsModal {
  exam: IExam;
  closeExamDetailsModal: () => void;
}

export const ExamDetailsModal = ({
  exam,
  closeExamDetailsModal,
}: IExamDetailsModal) => {
  const isClassEvaluation = !!exam.class;
  const hasResults = exam.results && exam.results.length > 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                <ClipboardList className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{exam.name}</h2>
                <p className="text-blue-100 mt-1">Detalhes da avaliação</p>
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
        <div className="flex-1 overflow-y-auto p-6">
          {/* Informações Básicas */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              Informações da Avaliação
            </h3>
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-3">
              <div className="flex items-center gap-3 text-slate-700">
                <GraduationCap className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <span className="text-sm text-slate-500 block">Professor</span>
                  <span className="font-medium">{exam.teacher.name}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-700">
                {isClassEvaluation ? (
                  <Users className="w-5 h-5 text-blue-600 shrink-0" />
                ) : (
                  <User className="w-5 h-5 text-blue-600 shrink-0" />
                )}
                <div>
                  <span className="text-sm text-slate-500 block">Tipo</span>
                  <div className="flex items-center gap-2">
                    {isClassEvaluation ? (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        Turma Completa
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-1">
                        <User className="w-3 h-3" />
                        Aluno Específico
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-700">
                <Award className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <span className="text-sm text-slate-500 block">
                    {isClassEvaluation ? "Turma" : "Aluno"}
                  </span>
                  <span className="font-medium">
                    {isClassEvaluation
                      ? exam.class?.name
                      : exam.enrollment?.student.name}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tópicos */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-blue-600" />
              Tópicos Avaliados
              <span className="text-sm font-normal text-slate-500 ml-1">
                ({exam.topics.length})
              </span>
            </h3>

            {exam.topics.length === 0 ? (
              <div className="bg-slate-50 rounded-lg p-8 text-center border border-slate-200">
                <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 font-medium">
                  Nenhum tópico cadastrado
                </p>
                <p className="text-slate-500 text-sm mt-1">
                  Esta avaliação não possui tópicos definidos
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {exam.topics.map((topic, index) => (
                  <div
                    key={topic.id}
                    className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md hover:border-blue-200 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-blue-700 font-semibold text-sm">
                          {index + 1}
                        </span>
                      </div>
                      <span className="font-medium text-slate-800">
                        {topic.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Resultados */}
          {hasResults && (
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600" />
                Resultados
                <span className="text-sm font-normal text-slate-500 ml-1">
                  ({exam.results.length})
                </span>
              </h3>

              <div className="space-y-4">
                {exam.results.map((result) => (
                  <div
                    key={result.id}
                    className="bg-white border border-slate-200 rounded-lg p-5"
                  >
                    {/* Nota Total */}
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200">
                      <span className="text-slate-700 font-medium">
                        Nota Total
                      </span>
                      <div className="flex items-center gap-2">
                        {result.totalScore >= 7 ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                        <span className="text-2xl font-bold text-slate-800">
                          {result.totalScore.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    {/* Pontuações por Tópico */}
                    {result.score && result.score.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                          Pontuação por Tópico
                        </h4>
                        {result.score.map((scoreItem) => (
                          <div
                            key={scoreItem.id}
                            className="bg-slate-50 rounded-lg p-4"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <span className="font-medium text-slate-800">
                                {scoreItem.topic.name}
                              </span>
                              <span
                                className={`text-lg font-bold ${
                                  scoreItem.score >= 7
                                    ? "text-green-600"
                                    : scoreItem.score >= 5
                                      ? "text-yellow-600"
                                      : "text-red-600"
                                }`}
                              >
                                {scoreItem.score.toFixed(1)}
                              </span>
                            </div>
                            {scoreItem.feedback && (
                              <div className="mt-2 pt-2 border-t border-slate-200">
                                <span className="text-xs text-slate-500 uppercase tracking-wide font-medium block mb-1">
                                  Feedback
                                </span>
                                <p className="text-sm text-slate-600">
                                  {scoreItem.feedback}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sem Resultados */}
          {!hasResults && (
            <div className="bg-slate-50 rounded-lg p-8 text-center border border-slate-200">
              <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-medium">
                Nenhum resultado disponível
              </p>
              <p className="text-slate-500 text-sm mt-1">
                Esta avaliação ainda não possui resultados lançados
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 p-4 bg-slate-50">
          <button
            onClick={closeExamDetailsModal}
            className="w-full md:w-auto px-6 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
