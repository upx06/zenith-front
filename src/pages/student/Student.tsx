import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
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

import { Menu } from "../../components/Menu";
import { CreateStudentModal } from "../../components/modals/create/CreateStudentModal";
import { UpdateStudentModal } from "../../components/modals/update/UpdateStudentModal";
import { PhoneDisplay } from "../../components/PhoneDisplay";
import { ConfirmationModal } from "../../components/modals/ConfirmationModal";

import type { IStudent } from "../../interfaces/IStudent";
import type { IListStudents } from "../../interfaces/IListStudents";

import { LIST_STUDENTS } from "../../graphql/queries/ListStudents";
import { DESTROY_STUDENT } from "../../graphql/mutations/DestroyStudent";
import { StudentDetailsModal } from "../../components/modals/StudentDetailsModal";
import { getPresignedUrlFromAwsS3 } from "../../utils/aws";

export const Student = () => {
  const [createStudentModal, setCreateStudentModal] = useState(false);
  const [updateStudentModal, setUpdateStudentModal] = useState(false);
  const [detailStudentModal, setDetailStudentModal] = useState(false);

  const [confirmationModal, setConfirmationModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<IStudent | null>(null);
  const [selectedStudentPhoto, setSelectedStudentPhoto] = useState<
    string | null
  >(null);
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(
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

  const { data, loading, error, refetch } = useQuery<IListStudents>(
    LIST_STUDENTS,
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

  const handleOpenUpdateModal = (student: IStudent, photoUrl: string) => {
    setSelectedStudent(student);
    setSelectedStudentPhoto(photoUrl);
    setUpdateStudentModal(true);
  };

  const handleOpenDetailsModal = (student: IStudent, photoUrl: string) => {
    setSelectedStudent(student);
    setSelectedStudentPhoto(photoUrl);
    setDetailStudentModal(true);
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
  const isProcessing = loadingDeleteStudent;
  const alunos = data?.listStudents?.results || [];
  const isLoadingData = loading || photosLoading;

  useEffect(() => {
    const loadPhotos = async () => {
      setPhotosLoading(true);
      const urls: Record<string, string> = {};

      for (const student of alunos) {
        if (student.photoKey) {
          try {
            const url = await getPresignedUrlFromAwsS3(
              student.photoKey,
              "profile-photo"
            );
            urls[student.id] = url;
          } catch (error) {
            console.error(
              `Erro ao carregar foto do aluno ${student.id}:`,
              error
            );
          }
        }
      }

      setPhotoUrls(urls);
      setPhotosLoading(false);
    };

    if (alunos.length > 0) {
      loadPhotos();
    } else {
      setPhotosLoading(false);
    }
  }, [alunos]);

  const getTotalPages = () => {
    if (!data) return 1;
    const totalPages = Math.ceil(data.listStudents.count / itemsPerPage);
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
                  Alunos
                </h1>
                <p className="text-slate-600 text-sm md:text-base">
                  Gerencie os alunos da instituição
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
                  onClick={() => setCreateStudentModal(true)}
                  disabled={isProcessing}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm md:text-base"
                >
                  <Plus className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden sm:inline">Novo Aluno</span>
                </button>
              </div>
            </div>

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
                    {filters.email && (
                      <button
                        onClick={() => handleFilterChange("email", "")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
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
                    {filters.phone && (
                      <button
                        onClick={() => handleFilterChange("phone", "")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
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
                {alunos.map((student: IStudent) => {
                  const photoUrl = photoUrls[student.id];

                  return (
                    <div
                      key={student.id}
                      className={`bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6 hover:shadow-md hover:border-slate-300 transition-all duration-200 ${
                        deletingStudentId === student.id ? "opacity-50" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {photoUrl ? (
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border border-slate-200 shrink-0">
                              <img
                                src={photoUrl}
                                alt={`Foto de ${student.name}`}
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
                              {student.name}
                            </h3>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Mail className="w-4 h-4 text-slate-400" />
                          <span className="text-sm truncate">
                            {student.email}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <Phone className="w-4 h-4 text-slate-400" />
                          <PhoneDisplay
                            phone={student.phone}
                            className="text-sm"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-slate-100">
                        <button
                          onClick={() =>
                            handleOpenDetailsModal(student, photoUrl)
                          }
                          disabled={isProcessing}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                        >
                          Ver detalhes
                        </button>
                        <button
                          onClick={() =>
                            handleOpenUpdateModal(student, photoUrl)
                          }
                          disabled={isProcessing}
                          className="flex items-center justify-center px-3 py-2 text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
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
                  );
                })}
              </div>
            </div>

            {data && alunos.length > 0 && (
              <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
                <button
                  onClick={() => {
                    currentPage > 1 && setCurrentPage(currentPage - 1);
                    setBefore(data.listStudents.startKeyset);
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
                    setAfter(data.listStudents.endKeyset);
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

            {alunos.length === 0 && hasActiveFilters && !isLoadingData && (
              <div className="text-center py-12">
                <Filter className="w-12 h-12 md:w-16 md:h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-600 mb-2">
                  Nenhum aluno encontrado
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

            {alunos.length === 0 && !hasActiveFilters && !isLoadingData && (
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
                photo={selectedStudentPhoto}
                closeUpdateStudentModal={() => setUpdateStudentModal(false)}
                refetchStudents={refetch}
              />
            )}

            {detailStudentModal && selectedStudent && (
              <StudentDetailsModal
                student={selectedStudent}
                photo={selectedStudentPhoto}
                closeStudentDetailsModal={() => setDetailStudentModal(false)}
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
