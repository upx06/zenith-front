import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import toast from "react-hot-toast";
import {
  Loader2,
  Mail,
  Phone,
  Plus,
  Trash2,
  Users,
  AlertCircle,
  Pencil,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { CreateTeacherModal } from "../../components/modals/create/CreateTeacherModal";
import { UpdateTeacherModal } from "../../components/modals/update/UpdateTeacherModal";
import { Menu } from "../../components/Menu";
import { PhoneDisplay } from "../../components/PhoneDisplay";
import { ConfirmationModal } from "../../components/modals/ConfirmationModal";

import { LIST_TEACHERS } from "../../graphql/queries/ListTeachers";
import { DESTROY_TEACHER } from "../../graphql/mutations/DestroyTeacher";

import type { ITeacher } from "../../interfaces/ITeacher";
import type { IListTeachers } from "../../interfaces/IListTeachers";
import { TeacherDetailsModal } from "../../components/modals/TeacherDetailsModal";
import { getPresignedUrlFromAwsS3 } from "../../utils/aws";

export const Teacher = () => {
  const [createTeacherModal, setCreateTeacherModal] = useState(false);
  const [updateTeacherModal, setUpdateTeacherModal] = useState(false);
  const [detailTeacherModal, setDetailTeacherModal] = useState(false);

  const [confirmationModal, setConfirmationModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<ITeacher | null>(null);
  const [selectedTeacherPhoto, setSelectedTeacherPhoto] = useState<
    string | null
  >(null);
  const [deletingTeacherId, setDeletingTeacherId] = useState<string | null>(
    null
  );
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});
  const [photosLoading, setPhotosLoading] = useState(true);

  const [after, setAfter] = useState<string | null>(null);
  const [before, setBefore] = useState<string | null>(null);
  const [beforeFirsPage, setBeforeFirstPage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const { data, loading, error, refetch } = useQuery<IListTeachers>(
    LIST_TEACHERS,
    {
      variables: {
        after: after || undefined,
        before: before || undefined,
        filter: {
          name: filters.name ? { ilike: `${filters.name}%` } : undefined,
          email: filters.email ? { ilike: `${filters.email}%` } : undefined,
          phone: filters.phone ? { ilike: `${filters.phone}%` } : undefined,
        },
      },
      fetchPolicy: "cache-and-network",
    }
  );

  const [
    deleteTeacher,
    { loading: loadingDeleteTeacher, error: errorDeleteTeacher },
  ] = useMutation(DESTROY_TEACHER);

  const handleDeleteTeacher = async (id: string) => {
    setDeletingTeacherId(id);
    try {
      await deleteTeacher({
        variables: { id },
      });
      await refetch();
      setConfirmationModal(false);
      setSelectedTeacher(null);
      toast.success("Professor excluído com sucesso!");
    } catch (err) {
      console.error("Erro ao excluir professor:", err);
      toast.error(errorDeleteTeacher?.message || "Erro ao excluir professor");
    } finally {
      setDeletingTeacherId(null);
    }
  };

  const handleOpenConfirmationModal = (teacher: ITeacher) => {
    setSelectedTeacher(teacher);
    setConfirmationModal(true);
  };

  const handleOpenUpdateModal = (teacher: ITeacher, photoUrl: string) => {
    setSelectedTeacher(teacher);
    setSelectedTeacherPhoto(photoUrl);
    setUpdateTeacherModal(true);
  };

  const handleOpenDetailsModal = (teacher: ITeacher, photoUrl: string) => {
    setSelectedTeacher(teacher);
    setSelectedTeacherPhoto(photoUrl);
    setDetailTeacherModal(true);
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
      email: "",
      phone: "",
    });
  };

  const hasActiveFilters = filters.name || filters.email || filters.phone;

  // Estados auxiliares
  const isProcessing = loadingDeleteTeacher;
  const professores = data?.listTeachers?.results || [];
  const isLoadingData = loading || photosLoading;

  useEffect(() => {
    const loadPhotos = async () => {
      setPhotosLoading(true);
      const urls: Record<string, string> = {};

      for (const teacher of professores) {
        if (teacher.photoKey) {
          try {
            const url = await getPresignedUrlFromAwsS3(
              teacher.photoKey,
              "profile-photo"
            );
            urls[teacher.id] = url;
          } catch (error) {
            console.error(
              `Erro ao carregar foto do professor ${teacher.id}:`,
              error
            );
          }
        }
      }

      setPhotoUrls(urls);
      setPhotosLoading(false);
    };

    if (professores.length > 0) {
      loadPhotos();
    } else {
      setPhotosLoading(false);
    }
  }, [professores]);

  const getTotalPages = () => {
    if (!data) return 1;
    const totalPages = Math.ceil(data.listTeachers.count / itemsPerPage);
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
        className="hidden lg:block lg:w-64 xl:w-72 shrink-0"
        aria-hidden="true"
      />
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Overlay de loading durante deleção */}
        {isProcessing && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-slate-600 font-medium">
                Excluindo professor...
              </p>
            </div>
          </div>
        )}

        <div className="flex-1 p-4 md:p-6 lg:p-8 mt-16 lg:mt-0">
          {/* Mensagem de erro da mutation de deleção */}
          {errorDeleteTeacher && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800 mb-2">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium">Erro ao excluir professor:</span>
              </div>
              <p className="text-red-700 text-sm mb-3">
                {errorDeleteTeacher.message}
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
                  Professores
                </h1>
                <p className="text-slate-600 text-sm md:text-base">
                  Gerencie os professores da instituição
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
                  onClick={() => setCreateTeacherModal(true)}
                  disabled={isProcessing}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm md:text-base"
                >
                  <Plus className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden sm:inline">Novo Professor</span>
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
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Filtrar por email..."
                      value={filters.email}
                      onChange={(e) =>
                        handleFilterChange("email", e.target.value)
                      }
                      disabled={isProcessing}
                      className="w-full pl-3 pr-8 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Filtrar por telefone..."
                      value={filters.phone}
                      onChange={(e) =>
                        handleFilterChange("phone", e.target.value)
                      }
                      disabled={isProcessing}
                      className="w-full pl-3 pr-8 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    />
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
              </div>
            </div>

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

            <div className="relative">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                {professores.map((teacher: ITeacher) => {
                  const photoUrl = photoUrls[teacher.id];
                  return (
                    <div
                      key={teacher.id}
                      className={`bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6 hover:shadow-md hover:border-slate-300 transition-all duration-200 ${
                        deletingTeacherId === teacher.id ? "opacity-50" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {photoUrl ? (
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border border-slate-200 shrink-0">
                              <img
                                src={photoUrl}
                                alt={`Foto de ${teacher.name}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
                              <Users className="w-5 h-5 md:w-6 md:h-6 text-white" />
                            </div>
                          )}
                          <div>
                            <h3 className="font-semibold text-slate-800 text-sm md:text-base">
                              {teacher.name}
                            </h3>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Mail className="w-4 h-4 text-slate-400" />
                          <span className="text-sm truncate">
                            {teacher.email}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <Phone className="w-4 h-4 text-slate-400" />
                          <PhoneDisplay
                            phone={teacher.phone}
                            className="text-sm"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-slate-100">
                        <button
                          onClick={() =>
                            handleOpenDetailsModal(teacher, photoUrl)
                          }
                          disabled={isProcessing}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                        >
                          Ver detalhes
                        </button>
                        <button
                          onClick={() =>
                            handleOpenUpdateModal(teacher, photoUrl)
                          }
                          disabled={isProcessing}
                          className="flex items-center justify-center px-3 py-2 text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenConfirmationModal(teacher)}
                          disabled={isProcessing}
                          className="flex items-center justify-center px-3 py-2 text-red-600 hover:bg-red-50 border border-red-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          title="Excluir"
                        >
                          {deletingTeacherId === teacher.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {data && professores.length > 0 && (
              <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
                <button
                  onClick={() => {
                    currentPage > 1 && setCurrentPage(currentPage - 1);
                    setBefore(data.listTeachers.startKeyset);
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
                    setAfter(data.listTeachers.endKeyset);
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

            {professores.length === 0 && hasActiveFilters && !isLoadingData && (
              <div className="text-center py-12">
                <Filter className="w-12 h-12 md:w-16 md:h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-600 mb-2">
                  Nenhum professor encontrado
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

            {professores.length === 0 &&
              !hasActiveFilters &&
              !isLoadingData && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 md:w-16 md:h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-600 mb-2">
                    Nenhum professor encontrado
                  </h3>
                  <button
                    onClick={() => setCreateTeacherModal(true)}
                    disabled={isProcessing}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors mx-auto text-sm md:text-base"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Professor
                  </button>
                </div>
              )}

            {createTeacherModal && (
              <CreateTeacherModal
                closeCreateTeacherModal={() => setCreateTeacherModal(false)}
                refetchTeachers={refetch}
              />
            )}

            {updateTeacherModal && selectedTeacher && (
              <UpdateTeacherModal
                teacher={selectedTeacher}
                photo={selectedTeacherPhoto}
                closeUpdateTeacherModal={() => setUpdateTeacherModal(false)}
                refetchTeachers={refetch}
              />
            )}

            {detailTeacherModal && selectedTeacher && (
              <TeacherDetailsModal
                teacher={selectedTeacher}
                photo={selectedTeacherPhoto}
                closeTeacherDetailsModal={() => setDetailTeacherModal(false)}
              />
            )}

            {confirmationModal && selectedTeacher && (
              <ConfirmationModal
                onClose={() => {
                  if (!isProcessing) {
                    setConfirmationModal(false);
                    setSelectedTeacher(null);
                  }
                }}
                onConfirm={() => handleDeleteTeacher(selectedTeacher.id)}
                title="Deleção de Professor"
                message={`Tem certeza que deseja excluir o(a) professor(a) ${selectedTeacher.name}?`}
                confirmText={
                  loadingDeleteTeacher ? "Excluindo..." : "Confirmar"
                }
                cancelText="Cancelar"
                isLoading={loadingDeleteTeacher}
                isDisabled={isProcessing}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
