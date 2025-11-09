import {
  X,
  Languages,
  Star,
  Users,
  UserPlus,
  Trash2,
  Check,
  Loader2,
} from "lucide-react";
import type { IClass } from "../../interfaces/IClass";
import { useLazyQuery, useMutation } from "@apollo/client/react";
import { useEffect, useState } from "react";
import { LIST_STUDENT_NOT_ENROLLED_IN_CLASS } from "../../graphql/queries/ListStudentNotEnrolledInClass";
import { PhoneDisplay } from "../PhoneDisplay";
import type { IEnrollment } from "../../interfaces/IEnrollment";
import type { IListSpecificEnrollments } from "../../interfaces/IListSpecificEnrollments";
import type { IListStudentNotEnrolledInClass } from "../../interfaces/IListStudentNotEnrolledInClass";
import { LIST_SPECIFIC_ENROLLMENTS } from "../../graphql/queries/ListSpecificClassEnrollments";
import { CREATE_ENROLLMENT } from "../../graphql/mutations/create/CreateEnrollment";
import { DESTROY_ENROLLMENT } from "../../graphql/mutations/destroy/DestroyEnrollment";

interface IManageClassModalProps {
  clas: IClass;
  closeManageClassModal: () => void;
  refetchClasses: () => void;
}

export const ManageClassModal = ({
  clas,
  closeManageClassModal,
  refetchClasses,
}: IManageClassModalProps) => {
  const [classId] = useState(clas.id);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isAddingStudents, setIsAddingStudents] = useState(false);
  const [destroyingEnrollmentId, setDestroyingEnrollmentId] = useState<
    string | null
  >(null);

  // Mutation para criar matrícula
  const [
    createEnrollment,
    { loading: loadingCreateEnrollment, error: errorCreateEnrollment },
  ] = useMutation(CREATE_ENROLLMENT);

  // Mutation para deletar matrícula
  const [
    destroyEnrollment,
    { loading: loadingDestroyEnrollment, error: errorDestroyEnrollment },
  ] = useMutation(DESTROY_ENROLLMENT);

  // ALUNOS MATRICULADOS NA TURMA
  const [
    getSpecificClassEnrollments,
    {
      loading: loadingSpecificClassEnrollments,
      error: errorSpecificClassEnrollments,
      data: dataSpecificClassEnrollments,
      refetch: refetchSpecificClassEnrollments,
    },
  ] = useLazyQuery<IListSpecificEnrollments>(LIST_SPECIFIC_ENROLLMENTS, {
    fetchPolicy: "no-cache",
  });

  // ALUNOS QUE NAO ESTAO MATRICULADOS NA TURMA
  const [
    getSpecificNoClassEnrollments,
    {
      loading: loadingSpecificNoClassEnrollments,
      error: errorSpecificNoClassEnrollments,
      data: dataSpecificNoClassEnrollments,
      refetch: refetchSpecificNoClassEnrollments,
    },
  ] = useLazyQuery<IListStudentNotEnrolledInClass>(
    LIST_STUDENT_NOT_ENROLLED_IN_CLASS,
    { fetchPolicy: "no-cache" }
  );

  useEffect(() => {
    getSpecificClassEnrollments({ variables: { classId } });
    getSpecificNoClassEnrollments({ variables: { classId } });
  }, [classId, getSpecificClassEnrollments, getSpecificNoClassEnrollments]);

  const handleStudentSelect = (studentId: string) => {
    // Impede seleção durante o carregamento
    if (loadingCreateEnrollment || loadingDestroyEnrollment) return;

    setSelectedStudents((prev) => {
      if (prev.includes(studentId)) {
        return prev.filter((id) => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const handleSaveStudents = async () => {
    // Impede múltiplos cliques
    if (loadingCreateEnrollment) return;

    try {
      // Usa Promise.all para criar todas as matrículas em paralelo
      await Promise.all(
        selectedStudents.map((studentId: string) =>
          createEnrollment({
            variables: {
              input: { studentId: studentId, classId: classId },
            },
          })
        )
      );

      // Recarrega as listas após sucesso
      await Promise.all([
        refetchSpecificClassEnrollments(),
        refetchSpecificNoClassEnrollments(),
      ]);

      // Limpa estados apenas se não houver erro
      setIsAddingStudents(false);
      setSelectedStudents([]);
    } catch (error) {
      console.error("Erro ao criar matrícula:", error);
      // Mantém o estado para o usuário tentar novamente
    } finally {
      refetchClasses();
    }
  };

  const handleDestroyEnrollment = async (enrollmentId: string) => {
    // Impede múltiplos cliques
    if (loadingDestroyEnrollment) return;

    setDestroyingEnrollmentId(enrollmentId);
    try {
      await destroyEnrollment({
        variables: {
          id: enrollmentId,
        },
      });

      // Recarrega as listas após sucesso
      await Promise.all([
        refetchSpecificClassEnrollments(),
        refetchSpecificNoClassEnrollments(),
      ]);
    } catch (error) {
      console.error("Erro ao deletar matrícula:", error);
    } finally {
      setDestroyingEnrollmentId(null);
    }
  };

  const handleCancelAddStudents = () => {
    // Impede cancelamento durante o carregamento
    if (loadingCreateEnrollment) return;
    setIsAddingStudents(false);
    setSelectedStudents([]);
  };

  // Estados auxiliares para controle de UI
  const isProcessing = loadingCreateEnrollment || loadingDestroyEnrollment;
  const classEnrollments =
    dataSpecificClassEnrollments?.listSpecificEnrollments || [];
  const noClassEnrollments =
    dataSpecificNoClassEnrollments?.studentsNotEnrolledInClass || [];

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={isProcessing ? undefined : closeManageClassModal}
    >
      <div
        className="bg-white rounded-lg w-full max-w-5xl mx-4 max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Overlay de loading durante processamento */}
        {isProcessing && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-slate-600 font-medium">
                {loadingCreateEnrollment
                  ? "Matriculando alunos..."
                  : "Removendo matrícula..."}
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-200 relative">
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
            onClick={isProcessing ? undefined : closeManageClassModal}
            disabled={isProcessing}
            className="p-1 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* Mensagem de erro da mutation */}
          {(errorCreateEnrollment || errorDestroyEnrollment) && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <X className="w-4 h-4" />
                <span className="font-medium">Erro:</span>
                <span className="text-sm">
                  {errorCreateEnrollment?.message ||
                    errorDestroyEnrollment?.message}
                </span>
              </div>
              <button
                onClick={() => {
                  if (errorCreateEnrollment) {
                    // Recarrega as queries em caso de erro
                    refetchSpecificClassEnrollments();
                    refetchSpecificNoClassEnrollments();
                  }
                }}
                className="mt-2 px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Tentar novamente
              </button>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Seção de Alunos Matriculados */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  {loadingSpecificClassEnrollments ? (
                    "Carregando alunos..."
                  ) : errorSpecificClassEnrollments ? (
                    <span className="text-red-600">Erro ao carregar</span>
                  ) : (
                    `Alunos Matriculados (${classEnrollments.length})`
                  )}
                </h3>
                {!isAddingStudents &&
                  !loadingSpecificClassEnrollments &&
                  !errorSpecificClassEnrollments && (
                    <button
                      onClick={() => setIsAddingStudents(true)}
                      disabled={isProcessing}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
                    >
                      <UserPlus className="w-4 h-4" />
                      Adicionar Aluno
                    </button>
                  )}
              </div>

              {/* Estados de Loading e Error para alunos matriculados */}
              {loadingSpecificClassEnrollments && (
                <div className="text-center py-8 bg-slate-50 rounded-lg">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-slate-500 text-sm">
                    Carregando alunos matriculados...
                  </p>
                </div>
              )}

              {errorSpecificClassEnrollments && (
                <div className="text-center py-8 bg-red-50 rounded-lg">
                  <Users className="w-12 h-12 text-red-300 mx-auto mb-2" />
                  <p className="text-red-600 text-sm">
                    Erro ao carregar alunos matriculados
                  </p>
                  <button
                    onClick={() =>
                      getSpecificClassEnrollments({ variables: { classId } })
                    }
                    className="mt-2 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Tentar novamente
                  </button>
                </div>
              )}

              {/* Lista de alunos matriculados */}
              {!loadingSpecificClassEnrollments &&
                !errorSpecificClassEnrollments && (
                  <>
                    {classEnrollments.length > 0 ? (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {classEnrollments.map((enrollment: IEnrollment) => (
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
                                  {enrollment.student?.email ||
                                    "email@exemplo.com"}
                                </p>
                              </div>
                            </div>
                            <button
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Remover aluno"
                              disabled={
                                isProcessing ||
                                destroyingEnrollmentId === enrollment.id
                              }
                              onClick={() => {
                                handleDestroyEnrollment(enrollment.id);
                              }}
                            >
                              {destroyingEnrollmentId === enrollment.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
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
                  </>
                )}
            </div>

            {/* Seção de Seleção de Alunos */}
            {isAddingStudents && (
              <div className="flex-1 border-t lg:border-t-0 lg:border-l lg:pl-6 pt-6 lg:pt-0">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-blue-600" />
                    {loadingSpecificNoClassEnrollments ? (
                      "Carregando alunos disponíveis..."
                    ) : errorSpecificNoClassEnrollments ? (
                      <span className="text-red-600">Erro ao carregar</span>
                    ) : (
                      `Selecionar Alunos (${selectedStudents.length} selecionados)`
                    )}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancelAddStudents}
                      disabled={loadingCreateEnrollment}
                      className="px-3 py-1.5 text-sm border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveStudents}
                      disabled={
                        selectedStudents.length === 0 ||
                        loadingSpecificNoClassEnrollments ||
                        loadingCreateEnrollment
                      }
                      className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {loadingCreateEnrollment ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          Salvar
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Estados de Loading e Error para alunos disponíveis */}
                {loadingSpecificNoClassEnrollments && (
                  <div className="text-center py-8 bg-slate-50 rounded-lg">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-slate-500 text-sm">
                      Carregando alunos disponíveis...
                    </p>
                  </div>
                )}

                {errorSpecificNoClassEnrollments && (
                  <div className="text-center py-8 bg-red-50 rounded-lg">
                    <UserPlus className="w-12 h-12 text-red-300 mx-auto mb-2" />
                    <p className="text-red-600 text-sm">
                      Erro ao carregar alunos disponíveis
                    </p>
                    <button
                      onClick={() =>
                        getSpecificNoClassEnrollments({
                          variables: { classId },
                        })
                      }
                      className="mt-2 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Tentar novamente
                    </button>
                  </div>
                )}

                {!loadingSpecificNoClassEnrollments &&
                  !errorSpecificNoClassEnrollments && (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {noClassEnrollments.length > 0 ? (
                        noClassEnrollments.map((student) => (
                          <div
                            key={student.id}
                            className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                              selectedStudents.includes(student.id)
                                ? "bg-blue-50 border-blue-200"
                                : "bg-white border-slate-200 hover:bg-slate-50"
                            } ${
                              loadingCreateEnrollment
                                ? "opacity-50 cursor-not-allowed"
                                : "cursor-pointer"
                            }`}
                            onClick={() => {
                              if (!loadingCreateEnrollment) {
                                handleStudentSelect(student.id);
                              }
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  selectedStudents.includes(student.id)
                                    ? "bg-blue-100"
                                    : "bg-slate-100"
                                }`}
                              >
                                {selectedStudents.includes(student.id) ? (
                                  <Check className="w-4 h-4 text-blue-600" />
                                ) : (
                                  <Users className="w-4 h-4 text-slate-400" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-slate-800 text-sm">
                                  {student.name}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {student.email}
                                </p>
                              </div>
                            </div>
                            <PhoneDisplay
                              phone={student.phone}
                              className="text-xs text-slate-400"
                            />
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 bg-slate-50 rounded-lg">
                          <UserPlus className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                          <p className="text-slate-500 text-sm">
                            Nenhum aluno disponível para matrícula
                          </p>
                        </div>
                      )}
                    </div>
                  )}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 md:p-6 border-t border-slate-200 bg-slate-50">
          <button
            onClick={isProcessing ? undefined : closeManageClassModal}
            disabled={isProcessing}
            className="w-full px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm md:text-base font-medium"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
