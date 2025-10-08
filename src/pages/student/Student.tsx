import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";

import { Menu } from "../../components/Menu";
import { CreateStudentModal } from "../../components/modals/CreateStudentModal";
import { UpdateStudentModal } from "../../components/modals/UpdateStudentModal";

import { PhoneDisplay } from "../../components/PhoneDisplay";
import { ConfirmationModal } from "../../components/modals/ConfirmationModal";

import type { IStudent } from "../../interfaces/IStudent";
import type { IListStudents } from "../../interfaces/IListStudents";

import { LIST_STUDENTS } from "../../graphql/queries/ListStudents";
import { DESTROY_STUDENT } from "../../graphql/mutations/DestroyStudent";

import { Mail, Phone, Plus, Trash2, Users } from "lucide-react";

export const Student = () => {
  const [createStudentModal, setCreateStudentModal] = useState(false);
  const [updateStudentModal, setUpdateStudentModal] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<IStudent | null>(null);

  const { data, loading, error, refetch } =
    useQuery<IListStudents>(LIST_STUDENTS);
  const [deleteStudent] = useMutation(DESTROY_STUDENT);

  const handleDeleteStudent = async (id: string) => {
    try {
      await deleteStudent({
        variables: {
          id: id,
        },
      });
      await refetch();
    } catch (err) {
      console.error("Erro ao excluir aluno:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex">
        <Menu />
        <div className="flex-1 flex items-center justify-center">
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex">
        <Menu />
        <div className="flex-1 flex items-center justify-center">
          <p>Erro ao carregar alunos: {error.message}</p>
        </div>
      </div>
    );
  }

  const alunos = data?.listStudent?.results || [];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Menu />
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 p-4 md:p-6 lg:p-8 mt-16 lg:mt-0">
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
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm md:text-base"
              >
                <Plus className="w-4 h-4 md:w-5 md:h-5" />
                Novo Aluno
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              {alunos.map((student: IStudent) => (
                <div
                  key={student.id}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6 hover:shadow-md hover:border-slate-300 transition-all duration-200"
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
                      onClick={() => {
                        setSelectedStudent(student);
                        setUpdateStudentModal(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors text-sm font-medium"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        setSelectedStudent(student);
                        setConfirmationModal(true);
                      }}
                      className="flex items-center justify-center px-3 py-2 text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
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
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors mx-auto text-sm md:text-base"
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
                onClose={() => setConfirmationModal(false)}
                onConfirm={() => handleDeleteStudent(selectedStudent.id)}
                title="Deleção de Aluno"
                message={`Tem certeza que deseja excluir o(a) aluno(a) ${selectedStudent.name} ?`}
                confirmText="Confirmar"
                cancelText="Cancelar"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
