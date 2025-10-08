import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";

import { CreateClassroomModal } from "../../components/modals/CreateClassroomModal";
import { UpdateClassroomModal } from "../../components/modals/UpdateClassroomModal";
import { Menu } from "../../components/Menu";
import { ConfirmationModal } from "../../components/modals/ConfirmationModal";

import { LIST_CLASSROOMS } from "../../graphql/queries/ListClassrooms";
import { DESTROY_CLASSROOM } from "../../graphql/mutations/DestroyClassroom";

import type { IClassroom } from "../../interfaces/IClassroom";
import type { IListClassroom } from "../../interfaces/IListClassroom";

import { Plus, Trash2, School, Users } from "lucide-react";

export const Classroom = () => {
  const [createClassroomModal, setCreateClassroomModal] = useState(false);
  const [updateClassroomModal, setUpdateClassroomModal] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState<IClassroom | null>(
    null
  );

  const { data, loading, error, refetch } =
    useQuery<IListClassroom>(LIST_CLASSROOMS);
  const [deleteClassroom] = useMutation(DESTROY_CLASSROOM);

  const handleDeleteClassroom = async (id: string) => {
    try {
      await deleteClassroom({
        variables: {
          id: id,
        },
      });
      await refetch();
    } catch (err) {
      console.error("Erro ao excluir sala:", err);
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
          <p>Erro ao carregar salas: {error.message}</p>
        </div>
      </div>
    );
  }

  const salas = data?.listClassroom?.results || [];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Menu />
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 p-4 md:p-6 lg:p-8 mt-16 lg:mt-0">
          <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-800 uppercase">
                  Salas de Aula
                </h1>
                <p className="text-slate-600 text-sm md:text-base">
                  Gerencie as salas de aula da instituição
                </p>
              </div>
              <button
                onClick={() => setCreateClassroomModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm md:text-base"
              >
                <Plus className="w-4 h-4 md:w-5 md:h-5" />
                Nova Sala
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              {salas.map((classroom: IClassroom) => (
                <div
                  key={classroom.id}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6 hover:shadow-md hover:border-slate-300 transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                        <School className="w-5 h-5 md:w-6 md:h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800 text-sm md:text-base">
                          {classroom.name}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span className="text-sm">
                        Capacidade:{" "}
                        <span className="font-semibold">
                          {classroom.capacity}
                        </span>{" "}
                        alunos
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setSelectedClassroom(classroom);
                        setUpdateClassroomModal(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors text-sm font-medium"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        setSelectedClassroom(classroom);
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

            {salas.length === 0 && (
              <div className="text-center py-12">
                <School className="w-12 h-12 md:w-16 md:h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-600 mb-2">
                  Nenhuma sala encontrada
                </h3>
                <button
                  onClick={() => setCreateClassroomModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors mx-auto text-sm md:text-base"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Sala
                </button>
              </div>
            )}

            {createClassroomModal && (
              <CreateClassroomModal
                closeCreateClassroomModal={() => setCreateClassroomModal(false)}
                refetchClassrooms={refetch}
              />
            )}

            {updateClassroomModal && selectedClassroom && (
              <UpdateClassroomModal
                classroom={selectedClassroom}
                closeUpdateClassroomModal={() => setUpdateClassroomModal(false)}
                refetchClassrooms={refetch}
              />
            )}

            {confirmationModal && selectedClassroom && (
              <ConfirmationModal
                onClose={() => setConfirmationModal(false)}
                onConfirm={() => handleDeleteClassroom(selectedClassroom.id)}
                title="Deleção de Sala"
                message={`Tem certeza que deseja excluir a sala ${selectedClassroom.name}?`}
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
