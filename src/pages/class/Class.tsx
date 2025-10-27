import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  Loader2,
  Plus,
  Trash2,
  GraduationCap,
  Users,
  AlertCircle,
  Pencil,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Settings,
  Star,
  Languages,
} from "lucide-react";

import { CreateClassModal } from "../../components/modals/create/CreateClassModal";
import { UpdateClassModal } from "../../components/modals/update/UpdateClassModal";
import { Menu } from "../../components/Menu";
import { ConfirmationModal } from "../../components/modals/ConfirmationModal";
import { ManageClassModal } from "../../components/modals/ManageClassModal";
import { ClassDetailsModal } from "../../components/modals/ClassDetailsModal";

import { LIST_CLASSES } from "../../graphql/queries/ListClasses";
import { DESTROY_CLASS } from "../../graphql/mutations/DestroyClass";
import { LIST_LANGUAGES } from "../../graphql/queries/ListLanguages";

import type { IClass } from "../../interfaces/IClass";
import type { IListClasses } from "../../interfaces/IListClasses";
import type { IListLanguages } from "../../interfaces/IListLanguages";

export const Class = () => {
  const [createClassModal, setCreateClassModal] = useState(false);
  const [updateClassModal, setUpdateClassModal] = useState(false);
  const [manageClassModal, setManageClassModal] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState(false);
  const [detailClassModal, setDetailClassModal] = useState(false);

  const [selectedClass, setSelectedClass] = useState<IClass | null>(null);
  const [deletingClassId, setDeletingClassId] = useState<string | null>(null);

  const [after, setAfter] = useState<string | null>(null);
  const [before, setBefore] = useState<string | null>(null);
  const [beforeFirsPage, setBeforeFirstPage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    name: "",
    level: "",
    language: "",
  });

  const { data, loading, error, refetch } = useQuery<IListClasses>(
    LIST_CLASSES,
    {
      variables: {
        after: after || undefined,
        before: before || undefined,
        filter: {
          name: filters.name ? { ilike: `${filters.name}%` } : undefined,
          level: filters.level ? { eq: `${filters.level}` } : undefined,
          languageId: filters.language
            ? { eq: `${filters.language}` }
            : undefined,
        },
      },
      fetchPolicy: "cache-and-network",
    }
  );

  const {
    data: dataLanguage,
    loading: loadingLanguage,
    error: errorLanguage,
  } = useQuery<IListLanguages>(LIST_LANGUAGES);

  const [
    deleteClass,
    { loading: loadingDeleteClass, error: errorDeleteClass },
  ] = useMutation(DESTROY_CLASS);

  const handleDeleteClass = async (id: string) => {
    setDeletingClassId(id);
    try {
      await deleteClass({
        variables: { id },
      });
      await refetch();
      setConfirmationModal(false);
      setSelectedClass(null);
    } catch (err) {
      console.error("Erro ao excluir turma:", err);
    } finally {
      setDeletingClassId(null);
    }
  };

  const handleOpenConfirmationModal = (classItem: IClass) => {
    setSelectedClass(classItem);
    setConfirmationModal(true);
  };

  const handleOpenUpdateModal = (classItem: IClass) => {
    setSelectedClass(classItem);
    setUpdateClassModal(true);
  };

  const handleOpenDetailsModal = (clas: IClass) => {
    setSelectedClass(clas);
    setDetailClassModal(true);
  };

  const handleOpenManageModal = (classItem: IClass) => {
    setSelectedClass(classItem);
    setManageClassModal(true);
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
      level: "",
      language: "",
    });
  };

  const hasActiveFilters = filters.name || filters.level || filters.language;

  // Estados auxiliares
  const isProcessing = loadingDeleteClass;
  const turmas = data?.listClasses?.results || [];
  const isLoadingData = loading;
  const linguagens = dataLanguage?.listLanguages?.results || [];

  const getTotalPages = () => {
    if (!data) return 1;
    const totalPages = Math.ceil(data.listClasses.count / itemsPerPage);
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
      <div className="min-h-screen bg-slate-50 flex">
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
    <div className="min-h-screen bg-slate-50 flex">
      <Menu />
      <div
        className="hidden lg:block lg:w-64 xl:w-72 flex-shrink-0"
        aria-hidden="true"
      />
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Overlay de loading durante deleção */}
        {isProcessing && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-slate-600 font-medium">Excluindo turma...</p>
            </div>
          </div>
        )}

        <div className="flex-1 p-4 md:p-6 lg:p-8 mt-16 lg:mt-0">
          {/* Mensagem de erro da mutation de deleção */}
          {errorDeleteClass && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800 mb-2">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium">Erro ao excluir turma:</span>
              </div>
              <p className="text-red-700 text-sm mb-3">
                {errorDeleteClass.message}
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
            <div className="flex flex-row justify-between gap-4 pt-5 md:pt-0">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-800 uppercase">
                  Turmas
                </h1>
                <p className="text-slate-600 text-sm md:text-base">
                  Gerencie as turmas da instituição
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  disabled={isProcessing}
                  className={`${
                    showFilters || hasActiveFilters
                      ? "bg-blue-600 text-white"
                      : "bg-white text-slate-700 border border-slate-300"
                  } hover:opacity-90 disabled:bg-slate-400 disabled:cursor-not-allowed px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all text-sm md:text-base relative`}
                  title="Filtros"
                >
                  <Filter className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden sm:inline">Filtros</span>
                  {hasActiveFilters && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                  )}
                </button>
                <button
                  onClick={() => setCreateClassModal(true)}
                  disabled={isProcessing}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm md:text-base"
                >
                  <Plus className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden sm:inline">Nova Turma</span>
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
              <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Filtrar por nome..."
                      value={filters.name}
                      onChange={(e) =>
                        handleFilterChange("name", e.target.value)
                      }
                      disabled={isProcessing}
                      className="w-full pl-3 pr-8 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    {filters.name && (
                      <button
                        onClick={() => handleFilterChange("name", "")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <select
                      value={filters.level}
                      onChange={(e) =>
                        handleFilterChange("level", e.target.value)
                      }
                      disabled={isProcessing}
                      className="w-full pl-3 pr-8 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">Todos os níveis</option>
                      <option value="A1">A1</option>
                      <option value="A2">A2</option>
                      <option value="B1">B1</option>
                      <option value="B2">B2</option>
                      <option value="C1">C1</option>
                      <option value="C2">C2</option>
                    </select>
                  </div>

                  <div className="relative">
                    <select
                      value={filters.language}
                      onChange={(e) =>
                        handleFilterChange("language", e.target.value)
                      }
                      disabled={isProcessing || loadingLanguage}
                      className="w-full pl-3 pr-8 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">Todas as linguagens</option>
                      {linguagens.map((language) => (
                        <option key={language.id} value={language.id}>
                          {language.name}
                        </option>
                      ))}
                    </select>
                    {loadingLanguage && (
                      <div className="absolute right-8 top-1/2 -translate-y-1/2">
                        <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleClearFilters}
                    disabled={!hasActiveFilters || isProcessing}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Limpar Filtros
                  </button>
                </div>

                {/* Mensagem de erro das linguagens */}
                {errorLanguage && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-800 mb-1">
                      <AlertCircle className="w-4 h-4" />
                      <span className="font-medium text-sm">
                        Erro ao carregar linguagens
                      </span>
                    </div>
                    <p className="text-red-700 text-sm">
                      {errorLanguage.message}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="relative min-h-[200px]">
              {isLoadingData && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    <p className="text-slate-600 font-medium">
                      Carregando dados...
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                {turmas.map((classItem: IClass) => (
                  <div
                    key={classItem.id}
                    className={`bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6 hover:shadow-md hover:border-slate-300 transition-all duration-200 ${
                      deletingClassId === classItem.id ? "opacity-50" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <GraduationCap className="w-5 h-5 md:w-6 md:h-6 text-white" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-slate-800 text-sm md:text-base truncate">
                            {classItem.name}
                          </h3>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Star className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span className="text-sm">{classItem.level}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Languages className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span className="text-sm truncate">
                          {classItem?.language?.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Users className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span className="text-sm">
                          {classItem.enrollments?.length || 0}{" "}
                          {classItem.enrollments?.length === 1
                            ? "aluno"
                            : "alunos"}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => handleOpenDetailsModal(classItem)}
                        disabled={isProcessing}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                      >
                        Ver detalhes
                      </button>

                      <button
                        onClick={() => handleOpenUpdateModal(classItem)}
                        disabled={isProcessing}
                        className="flex flex items-center justify-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleOpenManageModal(classItem)}
                        disabled={isProcessing}
                        className="flex flex items-center justify-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenConfirmationModal(classItem)}
                        disabled={isProcessing}
                        className="flex items-center justify-center px-3 py-2 text-red-600 hover:bg-red-50 border border-red-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Excluir"
                      >
                        {deletingClassId === classItem.id ? (
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

            {data && turmas.length > 0 && (
              <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
                <button
                  onClick={() => {
                    currentPage > 1 && setCurrentPage(currentPage - 1);
                    setBefore(data.listClasses.startKeyset);
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
                    setAfter(data.listClasses.endKeyset);
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

            {turmas.length === 0 && hasActiveFilters && !isLoadingData && (
              <div className="text-center py-12">
                <Filter className="w-12 h-12 md:w-16 md:h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-600 mb-2">
                  Nenhuma turma encontrada
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

            {turmas.length === 0 && !hasActiveFilters && !isLoadingData && (
              <div className="text-center py-12">
                <GraduationCap className="w-12 h-12 md:w-16 md:h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-600 mb-2">
                  Nenhuma turma encontrada
                </h3>
                <button
                  onClick={() => setCreateClassModal(true)}
                  disabled={isProcessing}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors mx-auto text-sm md:text-base"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Turma
                </button>
              </div>
            )}

            {createClassModal && (
              <CreateClassModal
                closeCreateClassModal={() => setCreateClassModal(false)}
                refetchClasses={refetch}
              />
            )}

            {updateClassModal && selectedClass && (
              <UpdateClassModal
                clas={selectedClass}
                closeUpdateClassModal={() => setUpdateClassModal(false)}
                refetchClasses={refetch}
              />
            )}

            {detailClassModal && selectedClass && (
              <ClassDetailsModal
                clas={selectedClass}
                closeClassDetailsModal={() => setDetailClassModal(false)}
              />
            )}

            {manageClassModal && selectedClass && (
              <ManageClassModal
                clas={selectedClass}
                closeManageClassModal={() => setManageClassModal(false)}
                refetchClasses={refetch}
              />
            )}

            {confirmationModal && selectedClass && (
              <ConfirmationModal
                onClose={() => {
                  if (!isProcessing) {
                    setConfirmationModal(false);
                    setSelectedClass(null);
                  }
                }}
                onConfirm={() => handleDeleteClass(selectedClass.id)}
                title="Deleção de Turma"
                message={`Tem certeza que deseja excluir a turma ${selectedClass.name}?`}
                confirmText={loadingDeleteClass ? "Excluindo..." : "Confirmar"}
                cancelText="Cancelar"
                isLoading={loadingDeleteClass}
                isDisabled={isProcessing}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
