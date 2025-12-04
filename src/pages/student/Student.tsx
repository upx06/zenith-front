import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
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
  FileText,
} from "lucide-react";

import { Menu } from "../../components/Menu";
import { CreateStudentModal } from "../../components/modals/create/CreateStudentModal";
import { UpdateStudentModal } from "../../components/modals/update/UpdateStudentModal";
import { PhoneDisplay } from "../../components/PhoneDisplay";
import { ConfirmationModal } from "../../components/modals/ConfirmationModal";

import type { IStudent } from "../../interfaces/IStudent";
import type { IListStudents } from "../../interfaces/IListStudents";

import { LIST_STUDENTS } from "../../graphql/queries/ListStudents";
import { DESTROY_STUDENT } from "../../graphql/mutations/destroy/DestroyStudent";
import { StudentDetailsModal } from "../../components/modals/StudentDetailsModal";
import { getPresignedUrlFromAwsS3 } from "../../utils/aws";

export const Student = () => {
  const { t } = useTranslation();

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
  const [generatingReportId, setGeneratingReportId] = useState<string | null>(
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

  // 👇 NOVA FUNÇÃO PARA GERAR RELATÓRIO
  const handleGenerateReport = async (student: IStudent) => {
    setGeneratingReportId(student.id);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/reports/student/${student.id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao gerar relatório");
      }

      // Converte resposta em blob (arquivo PDF)
      const blob = await response.blob();

      // Cria URL temporária para download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `relatorio_${student.name.replace(/\s+/g, "_")}_${
        new Date().toISOString().split("T")[0]
      }.pdf`;

      // Adiciona ao DOM, clica e remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Limpa a URL temporária
      window.URL.revokeObjectURL(url);

      toast.success(t("toast.student.reportSuccess"));
    } catch (err) {
      console.error("Erro ao gerar relatório:", err);
      toast.error(t("toast.student.reportError"));
    } finally {
      setGeneratingReportId(null);
    }
  };

  const handleDeleteStudent = async (id: string) => {
    setDeletingStudentId(id);
    try {
      await deleteStudent({
        variables: { id },
      });
      const { data: refetchedData } = await refetch();

      if (
        refetchedData?.listStudents?.results?.length === 0 &&
        currentPage > 1
      ) {
        setCurrentPage(currentPage - 1);
        setBefore(beforeFirsPage);
        setAfter(null);
      }

      setConfirmationModal(false);
      setSelectedStudent(null);
      toast.success(t("toast.student.deleteSuccess"));
    } catch (err) {
      console.error("Erro ao excluir aluno:", err);
      toast.error(t("toast.student.deleteError"));
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

  // Estados auxiliares - 👇 ATUALIZADO
  const isProcessing = loadingDeleteStudent || generatingReportId !== null;
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
                {deletingStudentId
                  ? t("student.delete.processing")
                  : t("student.report.generating")}
              </p>
            </div>
          </div>
        )}

        <div className="flex-1 p-4 md:p-6 lg:p-8 mt-16 lg:mt-0">
          {errorDeleteStudent && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800 mb-2">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium">
                  {t("errors.student.deleteError")}:
                </span>
              </div>
              <p className="text-red-700 text-sm mb-3">
                {errorDeleteStudent.message}
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
                  {t("student.title")}
                </h1>
                <p className="hidden sm:block text-slate-600 dark:text-slate-300 text-sm md:text-base">
                  {t("student.subtitle")}
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
                  onClick={() => setCreateStudentModal(true)}
                  disabled={isProcessing}
                  className="
                    bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 disabled:bg-slate-400 disabled:cursor-not-allowed
                    text-white rounded-lg flex items-center justify-center gap-2
                    transition-colors text-sm md:text-base
                    w-12 h-12 md:w-auto md:h-auto md:px-4 md:py-2
                  "
                >
                  <Plus className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden sm:inline">{t("student.new")}</span>
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
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-4 shadow-sm dark:shadow-slate-950/50">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={t("common.filters.byName")}
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
                      type="text"
                      placeholder={t("common.filters.byEmail")}
                      value={filters.email}
                      onChange={(e) =>
                        handleFilterChange("email", e.target.value)
                      }
                      disabled={isProcessing}
                      className="w-full pl-3 pr-8 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
                    />
                    {filters.email && (
                      <button
                        onClick={() => handleFilterChange("email", "")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      placeholder={t("common.filters.byPhone")}
                      value={filters.phone}
                      onChange={(e) =>
                        handleFilterChange("phone", e.target.value)
                      }
                      disabled={isProcessing}
                      className="w-full pl-3 pr-8 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
                    />
                    {filters.phone && (
                      <button
                        onClick={() => handleFilterChange("phone", "")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

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
                {alunos.map((student: IStudent) => {
                  const photoUrl = photoUrls[student.id];

                  return (
                    <div
                      key={student.id}
                      className={`bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 md:p-6 hover:shadow-md hover:border-slate-300 transition-all duration-200 ${
                        deletingStudentId === student.id ||
                        generatingReportId === student.id
                          ? "opacity-50"
                          : ""
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {photoUrl ? (
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0">
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
                            <h3 className="font-semibold text-slate-800 dark:text-white text-sm md:text-base">
                              {student.name}
                            </h3>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                          <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                          <span className="text-sm truncate">
                            {student.email}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                          <Phone className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                          <PhoneDisplay
                            phone={student.phone}
                            className="text-sm"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                        <button
                          onClick={() =>
                            handleOpenDetailsModal(student, photoUrl)
                          }
                          disabled={isProcessing}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                        >
                          {t("common.actions.viewDetails")}
                        </button>

                        <button
                          onClick={() => handleGenerateReport(student)}
                          disabled={isProcessing}
                          className="flex items-center justify-center px-3 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          title={t("common.actions.generate")}
                        >
                          {generatingReportId === student.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <FileText className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          onClick={() =>
                            handleOpenUpdateModal(student, photoUrl)
                          }
                          disabled={isProcessing}
                          className="flex items-center justify-center px-3 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          title={t("common.actions.edit")}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenConfirmationModal(student)}
                          disabled={isProcessing}
                          className="flex items-center justify-center px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          title={t("common.actions.delete")}
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
                    setAfter(data.listStudents.endKeyset);
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

            {alunos.length === 0 && hasActiveFilters && !isLoadingData && (
              <div className="text-center py-12">
                <Filter className="w-12 h-12 md:w-16 md:h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-600 dark:text-white mb-2">
                  {t("student.empty.withFilters.title")}
                </h3>
                <p className="text-slate-600 dark:text-white text-sm mb-4">
                  {t("student.empty.withFilters.message")}
                </p>
                <button
                  onClick={handleClearFilters}
                  className="border border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors mx-auto text-sm md:text-base"
                >
                  {t("common.actions.clearFilters")}
                </button>
              </div>
            )}

            {alunos.length === 0 && !hasActiveFilters && !isLoadingData && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 md:w-16 md:h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-600 dark:text-white mb-2">
                  {t("student.empty.noData.title")}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
                  {t("student.empty.noData.message")}
                </p>
                <button
                  onClick={() => setCreateStudentModal(true)}
                  disabled={isProcessing}
                  className="border border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors mx-auto text-sm md:text-base"
                >
                  <Plus className="w-4 h-4" />
                  {t("student.add")}
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
                title={t("student.delete.title")}
                message={t("student.delete.message", {
                  name: selectedStudent.name,
                })}
                confirmText={
                  loadingDeleteStudent
                    ? t("common.status.deleting")
                    : t("common.actions.confirm")
                }
                cancelText={t("common.actions.cancel")}
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
