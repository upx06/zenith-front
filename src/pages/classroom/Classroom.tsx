import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
      toast.success(t("classroom.delete.success"));
    } catch (err) {
      console.error("Erro ao excluir sala:", err);
      toast.error(
        errorDeleteClassroom?.message || t("errors.classroom.deleteError")
      );
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
              {t("errors.general.title")}
            </h2>
            <p className="text-slate-600 mb-6">{error.message}</p>
            <button
              onClick={() => refetch()}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              {t("common.actions.tryAgain")}
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
        {isProcessing && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-900 rounded-lg p-6 flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-slate-600 font-medium">
                {t("classroom.delete.processing")}
              </p>
            </div>
          </div>
        )}

        <div className="flex-1 p-4 md:p-6 lg:p-8 mt-16 lg:mt-0">
          {errorDeleteClassroom && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800 mb-2">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium">
                  {t("errors.classroom.deleteError")}:
                </span>
              </div>
              <p className="text-red-700 text-sm mb-3">
                {errorDeleteClassroom.message}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
              >
                {t("common.actions.reload")}
              </button>
            </div>
          )}

          <div className="space-y-4 md:space-y-6">
            <div className="flex flex-row justify-between items-center gap-4 pt-5 md:pt-0">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white uppercase">
                  {t("classroom.title")}
                </h1>{" "}
                <p className="hidden sm:block text-slate-600 dark:text-slate-300 text-sm md:text-base">
                  {t("classroom.subtitle")}
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
                  title={t("common.actions.filters")}
                >
                  <Filter className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden sm:inline">
                    {t("common.actions.filters")}
                  </span>
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
                  <span className="hidden sm:inline">{t("classroom.new")}</span>
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
                      placeholder={t("classroom.filters.byName")}
                      value={filters.name}
                      onChange={(e) =>
                        handleFilterChange("name", e.target.value)
                      }
                      disabled={isProcessing}
                      className="w-full pl-3 pr-8 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
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
                      placeholder={t("classroom.filters.byCapacity")}
                      value={filters.capacity}
                      onChange={(e) =>
                        handleFilterChange("capacity", e.target.value)
                      }
                      disabled={isProcessing}
                      min="1"
                      className="w-full pl-3 pr-8 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
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
                      {t("common.actions.clearFilters")}
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
                    {t("common.status.loadingData")}
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
                          <h3 className="font-semibold text-slate-800 dark:text-white text-sm md:text-base">
                            {classroom.name}
                          </h3>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <Users className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                        <span className="text-sm">
                          {t("common.common.capacity")}:{" "}
                          <span className="font-semibold">
                            {classroom.capacity}
                          </span>{" "}
                          {t("common.common.students")}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                      <button
                        onClick={() => handleOpenDetailsModal(classroom)}
                        disabled={isProcessing}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                      >
                        {t("common.actions.viewDetails")}
                      </button>
                      <button
                        onClick={() => handleOpenUpdateModal(classroom)}
                        disabled={isProcessing}
                        className="flex items-center justify-center px-3 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title={t("common.actions.edit")}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenConfirmationModal(classroom)}
                        disabled={isProcessing}
                        className="flex items-center justify-center px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title={t("common.actions.delete")}
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
                  className="flex items-center gap-1.5 px-3 md:px-4 py-2 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm font-medium"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {t("common.pagination.previous")}
                  </span>
                </button>

                <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-semibold min-w-[60px] text-center">
                  {t("common.pagination.page")} {currentPage}
                </div>

                <button
                  onClick={() => {
                    currentPage < getTotalPages() &&
                      setCurrentPage(currentPage + 1);
                    setAfter(data.listClassrooms.endKeyset);
                    setBefore(null);
                  }}
                  disabled={currentPage >= getTotalPages() || isLoadingData}
                  className="flex items-center gap-1.5 px-3 md:px-4 py-2 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm font-medium"
                >
                  <span className="hidden sm:inline">
                    {t("common.pagination.next")}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {salas.length === 0 && hasActiveFilters && !isLoadingData && (
              <div className="text-center py-12">
                <Filter className="w-12 h-12 md:w-16 md:h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-600 dark:text-white mb-2">
                  {t("classroom.empty.withFilters.title")}
                </h3>
                <p className="text-slate-600 dark:text-white text-sm mb-4">
                  {t("classroom.empty.withFilters.message")}
                </p>
                <button
                  onClick={handleClearFilters}
                  className="border border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors mx-auto text-sm md:text-base"
                >
                  {t("common.actions.clearFilters")}
                </button>
              </div>
            )}

            {salas.length === 0 && !hasActiveFilters && !isLoadingData && (
              <div className="text-center py-12">
                <School className="w-12 h-12 md:w-16 md:h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-600 dark:text-white mb-2">
                  {t("classroom.empty.noData.title")}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
                  {t("classroom.empty.noData.message")}
                </p>
                <button
                  onClick={() => setCreateClassroomModal(true)}
                  disabled={isProcessing}
                  className="border border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors mx-auto text-sm md:text-base"
                >
                  <Plus className="w-4 h-4" />
                  {t("classroom.add")}
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
                title={t("classroom.delete.title")}
                message={t("classroom.delete.message", {
                  name: selectedClassroom.name,
                })}
                confirmText={
                  loadingDeleteClassroom
                    ? t("classroom.delete.confirming")
                    : t("common.actions.confirm")
                }
                cancelText={t("common.actions.cancel")}
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
