import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  Loader2,
  Mail,
  Phone,
  Plus,
  Trash2,
  Users,
  AlertCircle,
} from "lucide-react";

import { Menu } from "../../components/Menu";
import { CreateStudentModal } from "../../components/modals/CreateStudentModal";
import { UpdateStudentModal } from "../../components/modals/UpdateStudentModal";
import { PhoneDisplay } from "../../components/PhoneDisplay";
import { ConfirmationModal } from "../../components/modals/ConfirmationModal";

import type { IStudent } from "../../interfaces/IStudent";
import type { IListStudents } from "../../interfaces/IListStudents";

import { LIST_STUDENTS } from "../../graphql/queries/ListStudents";
import { DESTROY_STUDENT } from "../../graphql/mutations/DestroyStudent";

export const Student = () => {
  const [createStudentModal, setCreateStudentModal] = useState(false);
  const [updateStudentModal, setUpdateStudentModal] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<IStudent | null>(null);
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(
    null
  );

  const { data, loading, error, refetch } =
    useQuery<IListStudents>(LIST_STUDENTS);

  const [
    deleteStudent,
    { loading: loadingDeleteStudent, error: errorDeleteStudent },
  ] = useMutation(DESTROY_STUDENT);

  const handleDeleteStudent = async (id: string) => {
    setDeletingStudentId(id);
    try {
      await deleteStudent({
        variables: { id },
      });
      await refetch();
      setConfirmationModal(false);
      setSelectedStudent(null);
    } catch (err) {
      console.error("Erro ao excluir aluno:", err);
    } finally {
      setDeletingStudentId(null);
    }
  };

  const handleOpenConfirmationModal = (student: IStudent) => {
    setSelectedStudent(student);
    setConfirmationModal(true);
  };

  const handleOpenUpdateModal = (student: IStudent) => {
    setSelectedStudent(student);
    setUpdateStudentModal(true);
  };

  // Estados auxiliares
  const isProcessing = loadingDeleteStudent;
  const alunos = data?.listStudents?.results || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex">
        <Menu />
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-slate-600 font-medium">Carregando alunos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex">
        <Menu />
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="text-center max-w-md">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-600 mb-2">
              Erro ao carregar alunos
            </h2>
            <p className="text-slate-600 mb-6">{error.message}</p>
            <button
              onClick={() => refetch()}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Menu />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Overlay de loading durante deleção */}
        {isProcessing && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-slate-600 font-medium">Excluindo aluno...</p>
            </div>
          </div>
        )}

        <div className="flex-1 p-4 md:p-6 lg:p-8 mt-16 lg:mt-0">
          {/* Mensagem de erro da mutation de deleção */}
          {errorDeleteStudent && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800 mb-2">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium">Erro ao excluir aluno:</span>
              </div>
              <p className="text-red-700 text-sm mb-3">
                {errorDeleteStudent.message}
              </p>
              <button
                onClick={() => window.location.reload()} // Recarrega a página para limpar o estado
                className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
              >
                Recarregar página
              </button>
            </div>
          )}

          <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-800 uppercase">
                  Alunos
                </h1>
                <p className="text-slate-600 text-sm md:text-base">
                  Gerencie os alunos da instituição
                </p>
              </div>
              <button
                onClick={() => setCreateStudentModal(true)}
                disabled={isProcessing}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm md:text-base"
              >
                <Plus className="w-4 h-4 md:w-5 md:h-5" />
                Novo Aluno
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              {alunos.map((student: IStudent) => (
                <div
                  key={student.id}
                  className={`bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6 hover:shadow-md hover:border-slate-300 transition-all duration-200 ${
                    deletingStudentId === student.id ? "opacity-50" : ""
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 md:w-6 md:h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800 text-sm md:text-base">
                          {student.name}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="text-sm truncate">{student.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <PhoneDisplay phone={student.phone} className="text-sm" />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleOpenUpdateModal(student)}
                      disabled={isProcessing}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleOpenConfirmationModal(student)}
                      disabled={isProcessing}
                      className="flex items-center justify-center px-3 py-2 text-red-600 hover:bg-red-50 border border-red-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Excluir"
                    >
                      {deletingStudentId === student.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {alunos.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 md:w-16 md:h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-600 mb-2">
                  Nenhum aluno encontrado
                </h3>
                <button
                  onClick={() => setCreateStudentModal(true)}
                  disabled={isProcessing}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors mx-auto text-sm md:text-base"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Aluno
                </button>
              </div>
            )}

            {createStudentModal && (
              <CreateStudentModal
                closeCreateStudentModal={() => setCreateStudentModal(false)}
                refetchStudents={refetch}
              />
            )}

            {updateStudentModal && selectedStudent && (
              <UpdateStudentModal
                student={selectedStudent}
                closeUpdateStudentModal={() => setUpdateStudentModal(false)}
                refetchStudents={refetch}
              />
            )}

            {confirmationModal && selectedStudent && (
              <ConfirmationModal
                onClose={() => {
                  if (!isProcessing) {
                    setConfirmationModal(false);
                    setSelectedStudent(null);
                  }
                }}
                onConfirm={() => handleDeleteStudent(selectedStudent.id)}
                title="Deleção de Aluno"
                message={`Tem certeza que deseja excluir o(a) aluno(a) ${selectedStudent.name}?`}
                confirmText={
                  loadingDeleteStudent ? "Excluindo..." : "Confirmar"
                }
                cancelText="Cancelar"
                isLoading={loadingDeleteStudent}
                isDisabled={isProcessing}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
