import {
  X,
  GraduationCap,
  Mail,
  Phone,
  BookOpen,
  Languages,
  Award,
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
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 p-6 text-white">
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
            <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              Informações do Aluno
            </h3>
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-3">
              <div className="flex items-center gap-3 text-slate-700">
                <Mail className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <span className="text-sm text-slate-500 block">E-mail</span>
                  <span className="font-medium break-all">{student.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-700">
                <Phone className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <span className="text-sm text-slate-500 block">Telefone</span>
                  <span className="font-medium">{student.phone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Matrículas */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              Matrículas
              <span className="text-sm font-normal text-slate-500 ml-1">
                ({enrollments.length})
              </span>
            </h3>

            {enrollments.length === 0 ? (
              <div className="bg-slate-50 rounded-lg p-8 text-center border border-slate-200">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 font-medium">
                  Nenhuma matrícula ativa
                </p>
                <p className="text-slate-500 text-sm mt-1">
                  Este aluno ainda não está matriculado em nenhuma turma
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {enrollments.map((enrollment, index) => (
                  <div
                    key={index}
                    className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md hover:border-blue-200 transition-all"
                  >
                    <div className="space-y-3">
                      {/* Nome da Turma */}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <BookOpen className="w-4 h-4 text-blue-600" />
                          <span className="font-semibold text-slate-800">
                            {enrollment.class.name}
                          </span>
                        </div>
                      </div>

                      {/* Nível */}
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-600">Nível:</span>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                          {enrollment.class.level}
                        </span>
                      </div>

                      {/* Idioma */}
                      <div className="flex items-center gap-2">
                        <Languages className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-600">Idioma:</span>
                        <span className="text-sm font-medium text-slate-700">
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

        {/* Footer */}
        <div className="border-t border-slate-200 p-4 bg-slate-50">
          <button
            onClick={closeStudentDetailsModal}
            className="w-full md:w-auto px-6 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
