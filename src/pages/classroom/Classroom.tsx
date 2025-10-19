import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  Loader2,
  Plus,
  Trash2,
  School,
  Users,
  AlertCircle,
  Pencil,
} from "lucide-react";

import { CreateClassroomModal } from "../../components/modals/create/CreateClassroomModal";
import { UpdateClassroomModal } from "../../components/modals/update/UpdateClassroomModal";
import { ClassroomDetailsModal } from "../../components/modals/ClassroomDetailsModal";
import { Menu } from "../../components/Menu";
import { ConfirmationModal } from "../../components/modals/ConfirmationModal";

import { LIST_CLASSROOMS } from "../../graphql/queries/ListClassrooms";
import { DESTROY_CLASSROOM } from "../../graphql/mutations/DestroyClassroom";

import type { IClassroom } from "../../interfaces/IClassroom";
import type { IListClassrooms } from "../../interfaces/IListClassrooms";

export const Classroom = () => {
  const [createClassroomModal, setCreateClassroomModal] = useState(false);
  const [updateClassroomModal, setUpdateClassroomModal] = useState(false);
  const [detailClassroomModal, setDetailClassroomModal] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState(false);

  const [selectedClassroom, setSelectedClassroom] = useState<IClassroom | null>(
    null
  );
  const [deletingClassroomId, setDeletingClassroomId] = useState<string | null>(
    null
  );

  const { data, loading, error, refetch } =
    useQuery<IListClassrooms>(LIST_CLASSROOMS);
  const [
    deleteClassroom,
    { loading: loadingDeleteClassroom, error: errorDeleteClassroom },
  ] = useMutation(DESTROY_CLASSROOM);

  const handleDeleteClassroom = async (id: string) => {
    setDeletingClassroomId(id);
    try {
      await deleteClassroom({
        variables: { id },
      });
      await refetch();
      setConfirmationModal(false);
      setSelectedClassroom(null);
    } catch (err) {
      console.error("Erro ao excluir sala:", err);
    } finally {
      setDeletingClassroomId(null);
    }
  };

  const handleOpenConfirmationModal = (classroom: IClassroom) => {
    setSelectedClassroom(classroom);
    setConfirmationModal(true);
  };

  const handleOpenUpdateModal = (classroom: IClassroom) => {
    setSelectedClassroom(classroom);
    setUpdateClassroomModal(true);
  };

  const handleOpenDetailsModal = (classroom: IClassroom) => {
    setSelectedClassroom(classroom);
    setDetailClassroomModal(true);
  };

  // Estados auxiliares
  const isProcessing = loadingDeleteClassroom;
  const salas = data?.listClassrooms?.results || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex">
        <Menu />
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-slate-600 font-medium">Carregando salas...</p>
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
              Erro ao carregar salas
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
      <div
        className="hidden lg:block lg:w-64 xl:w-72 flex-shrink-0"
        aria-hidden="true"
      />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Overlay de loading durante deleção */}
        {isProcessing && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-slate-600 font-medium">Excluindo sala...</p>
            </div>
          </div>
        )}

        <div className="flex-1 p-4 md:p-6 lg:p-8 mt-16 lg:mt-0">
          {/* Mensagem de erro da mutation de deleção */}
          {errorDeleteClassroom && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800 mb-2">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium">Erro ao excluir sala:</span>
              </div>
              <p className="text-red-700 text-sm mb-3">
                {errorDeleteClassroom.message}
              </p>
              <button
                onClick={() => window.location.reload()}
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
                  Salas de Aula
                </h1>
                <p className="text-slate-600 text-sm md:text-base">
                  Gerencie as salas de aula da instituição
                </p>
              </div>
              <button
                onClick={() => setCreateClassroomModal(true)}
                disabled={isProcessing}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm md:text-base"
              >
                <Plus className="w-4 h-4 md:w-5 md:h-5" />
                Nova Sala
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              {salas.map((classroom: IClassroom) => (
                <div
                  key={classroom.id}
                  className={`bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6 hover:shadow-md hover:border-slate-300 transition-all duration-200 ${
                    deletingClassroomId === classroom.id ? "opacity-50" : ""
                  }`}
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
                      onClick={() => handleOpenDetailsModal(classroom)}
                      disabled={isProcessing}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                    >
                      Ver detalhes
                    </button>
                    <button
                      onClick={() => handleOpenUpdateModal(classroom)}
                      disabled={isProcessing}
                      className="flex items-center justify-center px-3 py-2 text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenConfirmationModal(classroom)}
                      disabled={isProcessing}
                      className="flex items-center justify-center px-3 py-2 text-red-600 hover:bg-red-50 border border-red-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Excluir"
                    >
                      {deletingClassroomId === classroom.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
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
                  disabled={isProcessing}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors mx-auto text-sm md:text-base"
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

            {detailClassroomModal && selectedClassroom && (
              <ClassroomDetailsModal
                classroom={selectedClassroom}
                closeClassroomDetailsModal={() =>
                  setDetailClassroomModal(false)
                }
              />
            )}

            {confirmationModal && selectedClassroom && (
              <ConfirmationModal
                onClose={() => {
                  if (!isProcessing) {
                    setConfirmationModal(false);
                    setSelectedClassroom(null);
                  }
                }}
                onConfirm={() => handleDeleteClassroom(selectedClassroom.id)}
                title="Deleção de Sala"
                message={`Tem certeza que deseja excluir a sala ${selectedClassroom.name}?`}
                confirmText={
                  loadingDeleteClassroom ? "Excluindo..." : "Confirmar"
                }
                cancelText="Cancelar"
                isLoading={loadingDeleteClassroom}
                isDisabled={isProcessing}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
