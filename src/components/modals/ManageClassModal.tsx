import {
  X,
  Languages,
  Star,
  Users,
  UserPlus,
  Trash2,
  Check,
} from "lucide-react";
import type { IClass } from "../../interfaces/IClass";
import { useQuery } from "@apollo/client/react";
import { useState } from "react";
import { LIST_ENROLLMENTS } from "../../graphql/queries/ListEnrollments";
import { PhoneDisplay } from "../PhoneDisplay";
import type { IListEnrollments } from "../../interfaces/IListEnrollments";
import type { IEnrollment } from "../../interfaces/IEnrollment";
import { LIST_NO_CLASS_ENROLLMENTS } from "../../graphql/queries/ListNoClassEnrollments";
import type { IListNoClassEnrollments } from "../../interfaces/IListNoClassEnrollments";
import { LIST_CLASS_ENROLLMENTS } from "../../graphql/queries/ListClassEnrollments";
import type { IListClassEnrollments } from "../../interfaces/IListClassEnrollments";

interface IManageClassModalProps {
  clas: IClass;
  closeManageClassModal: () => void;
}

export const ManageClassModal = ({
  clas,
  closeManageClassModal,
}: IManageClassModalProps) => {
  console.log(clas);

  const {
    data: dataEnrollments,
    loading: loadingEnrollments,
    error: errorEnrollments,
  } = useQuery<IListEnrollments>(LIST_ENROLLMENTS);

  const {
    data: dataClassEnrollments,
    loading: loadingClassEnrollments,
    error: errorClassEnrollments,
  } = useQuery<IListClassEnrollments>(LIST_CLASS_ENROLLMENTS);

  console.log(dataClassEnrollments);

  const {
    data: dataNoClassEnrollments,
    loading: loadingNoClassEnrollments,
    error: errorNoClassEnrollments,
  } = useQuery<IListNoClassEnrollments>(LIST_NO_CLASS_ENROLLMENTS);

  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isAddingStudents, setIsAddingStudents] = useState(false);

  const handleStudentSelect = (studentId: string) => {
    setSelectedStudents((prev) => {
      if (prev.includes(studentId)) {
        return prev.filter((id) => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const handleSaveStudents = () => {
    // Aqui você pode implementar a mutation para salvar os alunos selecionados
    console.log("Alunos selecionados:", selectedStudents);
    // Exemplo: saveStudentsToClass({ variables: { classId: clas.id, studentIds: selectedStudents } })
    setIsAddingStudents(false);
    setSelectedStudents([]);
  };

  const handleCancelAddStudents = () => {
    setIsAddingStudents(false);
    setSelectedStudents([]);
  };

  const enrollments = dataEnrollments?.listEnrollments?.results || [];
  const classEnrollments = dataClassEnrollments?.listClassEnrollments || [];
  const noClassEnrollments =
    dataNoClassEnrollments?.listNoClassEnrollments || [];

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={closeManageClassModal}
    >
      <div
        className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-200">
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-slate-800">
              {clas.name}
            </h2>
            <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
              <div className="flex items-center gap-1">
                <Languages className="w-4 h-4 text-slate-400" />
                <span>{clas.language?.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-slate-400" />
                <span>{clas.level}</span>
              </div>
            </div>
          </div>
          <button
            onClick={closeManageClassModal}
            className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="space-y-6">
            {/* Seção de Alunos Matriculados */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Alunos Matriculados ({clas.enrollments?.length || 0})
                </h3>
                <button
                  onClick={() => setIsAddingStudents(true)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  Adicionar Aluno
                </button>
              </div>

              {clas.enrollments && clas.enrollments.length > 0 ? (
                <div className="space-y-2">
                  {clas.enrollments.map((enrollment: IEnrollment) => (
                    <div
                      key={enrollment.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 text-sm">
                            {enrollment.student?.name || "Nome do aluno"}
                          </p>
                          <p className="text-xs text-slate-500">
                            {enrollment.student?.email || "email@exemplo.com"}
                          </p>
                        </div>
                      </div>
                      <button
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remover aluno"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-50 rounded-lg">
                  <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">
                    Nenhum aluno matriculado nesta turma
                  </p>
                </div>
              )}
            </div>

            {/* Seção de Seleção de Alunos */}
            {isAddingStudents && (
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-blue-600" />
                    Selecionar Alunos ({selectedStudents.length} selecionados)
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancelAddStudents}
                      className="px-3 py-1.5 text-sm border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveStudents}
                      disabled={selectedStudents.length === 0}
                      className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
                    >
                      Salvar
                    </button>
                  </div>
                </div>

                {loadingEnrollments ? (
                  <div className="text-center py-4">
                    <p className="text-slate-500">Carregando alunos...</p>
                  </div>
                ) : errorEnrollments ? (
                  <div className="text-center py-4">
                    <p className="text-red-500">Erro ao carregar alunos</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {noClassEnrollments.map((enrollment) => (
                      <div
                        key={enrollment.id}
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedStudents.includes(enrollment.id)
                            ? "bg-blue-50 border-blue-200"
                            : "bg-white border-slate-200 hover:bg-slate-50"
                        }`}
                        onClick={() => handleStudentSelect(enrollment.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              selectedStudents.includes(enrollment.id)
                                ? "bg-blue-100"
                                : "bg-slate-100"
                            }`}
                          >
                            {selectedStudents.includes(enrollment.id) ? (
                              <Check className="w-4 h-4 text-blue-600" />
                            ) : (
                              <Users className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800 text-sm">
                              {enrollment.student.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {enrollment.student.email}
                            </p>
                          </div>
                        </div>
                        <PhoneDisplay
                          phone={enrollment.student.phone}
                          className="text-xs text-slate-400"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 md:p-6 border-t border-slate-200 bg-slate-50">
          <button
            onClick={closeManageClassModal}
            className="w-full px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors text-sm md:text-base font-medium"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
