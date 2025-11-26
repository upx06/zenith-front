import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import toast from "react-hot-toast";
import {
  Loader2,
  Plus,
  Trash2,
  School,
  Users,
  AlertCircle,
  Pencil,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { CreateClassroomModal } from "../../components/modals/create/CreateClassroomModal";
import { UpdateClassroomModal } from "../../components/modals/update/UpdateClassroomModal";
import { ClassroomDetailsModal } from "../../components/modals/ClassroomDetailsModal";
import { Menu } from "../../components/Menu";
import { ConfirmationModal } from "../../components/modals/ConfirmationModal";

import { LIST_CLASSROOMS } from "../../graphql/queries/ListClassrooms";
import { DESTROY_CLASSROOM } from "../../graphql/mutations/destroy/DestroyClassroom";

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

  const [after, setAfter] = useState<string | null>(null);
  const [before, setBefore] = useState<string | null>(null);
  const [beforeFirsPage, setBeforeFirstPage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    name: "",
    capacity: "",
  });

  const { data, loading, error, refetch } = useQuery<IListClassrooms>(
    LIST_CLASSROOMS,
    {
      variables: {
        after: after || undefined,
        before: before || undefined,
        filter: {
          name: filters.name ? { ilike: `${filters.name}%` } : undefined,
          capacity: filters.capacity
            ? { eq: parseInt(filters.capacity) }
            : undefined,
        },
      },
      fetchPolicy: "cache-and-network",
    }
  );

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
      const { data: refetchedData } = await refetch();

      // Se a página atual ficou vazia e não é a primeira página, volta para a anterior
      if (
        refetchedData?.listClassrooms?.results?.length === 0 &&
        currentPage > 1
      ) {
        setCurrentPage(currentPage - 1);
        setBefore(beforeFirsPage);
        setAfter(null);
      }

      setConfirmationModal(false);
      setSelectedClassroom(null);
      toast.success("Sala excluída com sucesso!");
    } catch (err) {
      console.error("Erro ao excluir sala:", err);
      toast.error(errorDeleteClassroom?.message || "Erro ao excluir sala");
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

  const handleFilterChange = (field: keyof typeof filters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      name: "",
      capacity: "",
    });
  };

  const hasActiveFilters = filters.name || filters.capacity;

  // Estados auxiliares
  const isProcessing = loadingDeleteClassroom;
  const salas = data?.listClassrooms?.results || [];
  const isLoadingData = loading;

  const getTotalPages = () => {
    if (!data) return 1;
    const totalPages = Math.ceil(data.listClassrooms.count / itemsPerPage);
    return totalPages || 1;
  };

  useEffect(() => {
    if (currentPage === 1) {
      setBeforeFirstPage(before);
    } else {
      setBefore(beforeFirsPage);
      setCurrentPage(1);
    }
  }, [filters]);

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
        <Menu />
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="text-center max-w-md">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-600 mb-2">
              Erro ao carregar dados
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      <Menu />
      <div
        className="hidden lg:block lg:w-64 xl:w-72 shrink-0"
        aria-hidden="true"
      />
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Overlay de loading durante deleção */}
        {isProcessing && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-900 rounded-lg p-6 flex flex-col items-center gap-3">
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
            <div className="flex flex-row justify-between items-center gap-4 pt-5 md:pt-0">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white uppercase">
                  Salas de Aula
                </h1>{" "}
                <p className="hidden sm:block text-slate-600 dark:text-slate-300 text-sm md:text-base">
                  Gerencie as salas de aula da instituição
                </p>
              </div>

              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  disabled={isProcessing}
                  className={`
                    ${
                      showFilters || hasActiveFilters
                        ? "bg-blue-600 text-white"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700"
                    } 
                    hover:opacity-90 disabled:bg-slate-400 disabled:cursor-not-allowed 
                    rounded-lg flex items-center justify-center gap-2 transition-all 
                    text-sm md:text-base relative
                    w-12 h-12 md:w-auto md:h-auto md:px-4 md:py-2
                  `}
                  title="Filtros"
                >
                  <Filter className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden sm:inline">Filtros</span>
                  {hasActiveFilters && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                  )}
                </button>

                <button
                  onClick={() => setCreateClassroomModal(true)}
                  disabled={isProcessing}
                  className="
                    bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 disabled:bg-slate-400 disabled:cursor-not-allowed 
                    text-white rounded-lg flex items-center justify-center gap-2 
                    transition-colors text-sm md:text-base
                    w-12 h-12 md:w-auto md:h-auto md:px-4 md:py-2
                  "
                >
                  <Plus className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden sm:inline">Nova Sala</span>
                </button>
              </div>
            </div>

            {/* Filtros */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                showFilters
                  ? "max-h-96 opacity-100 mb-4"
                  : "max-h-0 opacity-0 pointer-events-none mb-0"
              }`}
            >
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-4 shadow-sm dark:shadow-slate-950/50">
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-3">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Filtrar por nome..."
                      value={filters.name}
                      onChange={(e) =>
                        handleFilterChange("name", e.target.value)
                      }
                      disabled={isProcessing}
                      className="w-full pl-3 pr-8 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    {filters.name && (
                      <button
                        onClick={() => handleFilterChange("name", "")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <input
                      type="number"
                      placeholder="Filtrar por capacidade..."
                      value={filters.capacity}
                      onChange={(e) =>
                        handleFilterChange("capacity", e.target.value)
                      }
                      disabled={isProcessing}
                      min="1"
                      className="w-full pl-3 pr-8 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    {filters.capacity && (
                      <button
                        onClick={() => handleFilterChange("capacity", "")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <button
                      onClick={handleClearFilters}
                      disabled={!hasActiveFilters || isProcessing}
                      className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Limpar Filtros
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {isLoadingData && (
              <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 flex items-center justify-center z-10 rounded-lg">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  <p className="text-slate-600 font-medium">
                    Carregando dados...
                  </p>
                </div>
              </div>
            )}

            <div className="relative">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                {salas.map((classroom: IClassroom) => (
                  <div
                    key={classroom.id}
                    className={`bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 md:p-6 hover:shadow-md hover:border-slate-300 transition-all duration-200 ${
                      deletingClassroomId === classroom.id ? "opacity-50" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-600 rounded-full flex items-center justify-center">
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
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <Users className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                        <span className="text-sm">
                          Capacidade:{" "}
                          <span className="font-semibold">
                            {classroom.capacity}
                          </span>{" "}
                          alunos
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800-100">
                      <button
                        onClick={() => handleOpenDetailsModal(classroom)}
                        disabled={isProcessing}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
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
            </div>

            {data && salas.length > 0 && (
              <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
                <button
                  onClick={() => {
                    currentPage > 1 && setCurrentPage(currentPage - 1);
                    setBefore(data.listClassrooms.startKeyset);
                    setAfter(null);
                  }}
                  disabled={currentPage <= 1 || isLoadingData}
                  className="flex items-center gap-1.5 px-3 md:px-4 py-2 bg-white border-2 border-slate-300 text-slate-700 rounded-lg hover:border-blue-500 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm font-medium"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Anterior</span>
                </button>

                <div className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold min-w-[60px] text-center">
                  Pág. {currentPage}
                </div>

                <button
                  onClick={() => {
                    currentPage < getTotalPages() &&
                      setCurrentPage(currentPage + 1);
                    setAfter(data.listClassrooms.endKeyset);
                    setBefore(null);
                  }}
                  disabled={currentPage >= getTotalPages() || isLoadingData}
                  className="flex items-center gap-1.5 px-3 md:px-4 py-2 bg-white border-2 border-slate-300 text-slate-700 rounded-lg hover:border-blue-500 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm font-medium"
                >
                  <span className="hidden sm:inline">Próxima</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {salas.length === 0 && hasActiveFilters && !isLoadingData && (
              <div className="text-center py-12">
                <Filter className="w-12 h-12 md:w-16 md:h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-600 mb-2">
                  Nenhuma sala encontrada
                </h3>
                <p className="text-slate-500 text-sm mb-4">
                  Tente ajustar os filtros para encontrar o que procura
                </p>
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Limpar Filtros
                </button>
              </div>
            )}

            {salas.length === 0 && !hasActiveFilters && !isLoadingData && (
              <div className="text-center py-12">
                <School className="w-12 h-12 md:w-16 md:h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-600 mb-2">
                  Nenhuma sala encontrada
                </h3>
                <button
                  onClick={() => setCreateClassroomModal(true)}
                  disabled={isProcessing}
                  className="bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 disabled:bg-slate-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors mx-auto text-sm md:text-base"
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
