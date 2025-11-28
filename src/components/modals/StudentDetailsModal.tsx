import {
  X,
  GraduationCap,
  Mail,
  Phone,
  BookOpen,
  Languages,
  Award,
  Target,
} from "lucide-react";
import type { IStudent } from "../../interfaces/IStudent";

interface IStudentDetailsModal {
  student: IStudent;
  photo: string | null;
  closeStudentDetailsModal: () => void;
}

export const StudentDetailsModal = ({
  student,
  photo,
  closeStudentDetailsModal,
}: IStudentDetailsModal) => {
  const enrollments = student.enrollment || [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 dark:bg-blue-500 p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {photo ? (
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/20 shrink-0">
                  <img
                    src={photo}
                    alt={`Foto de ${student.name}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                  <GraduationCap className="w-7 h-7" />
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold">{student.name}</h2>
                <p className="text-blue-100 mt-1">Detalhes do aluno</p>
              </div>
            </div>
            <button
              onClick={closeStudentDetailsModal}
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
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Informações do Aluno
            </h3>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                <div>
                  <span className="text-sm text-slate-500 dark:text-slate-400 block">E-mail</span>
                  <span className="font-medium break-all">{student.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
                <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                <div>
                  <span className="text-sm text-slate-500 dark:text-slate-400 block">Telefone</span>
                  <span className="font-medium">{student.phone}</span>
                </div>
              </div>

              {student.goal && (
                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
                  <Target className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <div>
                    <span className="text-sm text-slate-500 dark:text-slate-400 block">
                      Objetivo Atual
                    </span>
                    <span className="font-medium">{student.goal}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Matrículas */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Matrículas
              <span className="text-sm font-normal text-slate-500 dark:text-slate-400 ml-1">
                ({enrollments.length})
              </span>
            </h3>

            {enrollments.length === 0 ? (
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-8 text-center border border-slate-200 dark:border-slate-700">
                <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-slate-600 dark:text-slate-300 font-medium">
                  Nenhuma matrícula ativa
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                  Este aluno ainda não está matriculado em nenhuma turma
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {enrollments.map((enrollment, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-400 transition-all"
                  >
                    <div className="space-y-3">
                      {/* Nome da Turma */}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <span className="font-semibold text-slate-800 dark:text-white">
                            {enrollment.class.name}
                          </span>
                        </div>
                      </div>

                      {/* Nível */}
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                        <span className="text-sm text-slate-600 dark:text-slate-300">Nível:</span>
                        <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs font-medium">
                          {enrollment.class.level}
                        </span>
                      </div>

                      {/* Idioma */}
                      <div className="flex items-center gap-2">
                        <Languages className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                        <span className="text-sm text-slate-600 dark:text-slate-300">Idioma:</span>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          {enrollment.class.language.name}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
