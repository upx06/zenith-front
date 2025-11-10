import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import {
  Loader2,
  AlertCircle,
  Plus,
  ClipboardList,
  User,
  Users,
  GraduationCap,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  Eye,
  Award,
} from "lucide-react";

import { Menu } from "../../components/Menu";
import { CreateExamModal } from "../../components/modals/create/CreateExamModal";
import { ExamDetailsModal } from "../../components/modals/ExamDetailsModal";
import { GradesControlModal } from "../../components/modals/GradesControlModal";
import type { IListExams } from "../../interfaces/IListExams";
import { LIST_EXAMS } from "../../graphql/queries/ListExams";
import type { IExam } from "../../interfaces/IExam";
import { UpdateExamModal } from "../../components/modals/update/UpdateExamModal";

export const Exam = () => {
  const [createExamModal, setCreateExamModal] = useState(false);
  const [detailsExamModal, setDetailsExamModal] = useState(false);
  const [gradesControlModal, setGradesControlModal] = useState(false);
  const [updateExamModal, setUpdateExamModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState<IExam | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    name: "",
    startDate: "",
    endDate: "",
    teacherId: "",
    type: "all", // all, class, student
  });

  const [after, setAfter] = useState<string | null>(null);
  const [before, setBefore] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data, loading, error, refetch } = useQuery<IListExams>(LIST_EXAMS, {
    variables: {
      after: after || undefined,
      before: before || undefined,
      filter: buildEvaluationFilter(),
    },
    fetchPolicy: "network-only",
  });

  function buildEvaluationFilter() {
    const filter: any = {};

    if (filters.name) {
      filter.name = { ilike: `${filters.name}%` };
    }

    if (filters.startDate && filters.endDate) {
      filter.and = [
        {
          date: {
            greaterThanOrEqual: new Date(filters.startDate).toISOString(),
          },
        },
        {
          date: {
            lessThanOrEqual: new Date(
              filters.endDate + "T23:59:59"
            ).toISOString(),
          },
        },
      ];
    } else if (filters.startDate) {
      filter.date = {
        greaterThanOrEqual: new Date(filters.startDate).toISOString(),
      };
    } else if (filters.endDate) {
      filter.date = {
        lessThanOrEqual: new Date(filters.endDate + "T23:59:59").toISOString(),
      };
    }

    if (filters.teacherId) {
      filter.teacherId = { eq: filters.teacherId };
    }

    if (filters.type === "class") {
      filter.classId = { isNotNull: true };
    } else if (filters.type === "student") {
      filter.studentId = { isNotNull: true };
    }

    return Object.keys(filter).length > 0 ? filter : undefined;
  }

  const handleFilterChange = (field: keyof typeof filters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
    setCurrentPage(1);
    setAfter(null);
    setBefore(null);
  };

  const handleClearFilters = () => {
    setFilters({
      name: "",
      startDate: "",
      endDate: "",
      teacherId: "",
      type: "all",
    });
    setCurrentPage(1);
    setAfter(null);
    setBefore(null);
  };

  const hasActiveFilters =
    filters.name ||
    filters.startDate ||
    filters.endDate ||
    filters.teacherId ||
    filters.type !== "all";

  const exams = data?.listExams?.results || [];

  const getTotalPages = () => {
    if (!data) return 1;
    const totalPages = Math.ceil(data.listExams.count / itemsPerPage);
    return totalPages || 1;
  };

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
        <div className="flex-1 p-4 md:p-6 lg:p-8 mt-16 lg:mt-0">
          <div className="space-y-4 md:space-y-6">
            {/* Header */}
            <div className="flex flex-row justify-between items-center gap-4 pt-5 md:pt-0">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl md:text-2xl font-bold text-slate-800 uppercase">
                  Avaliações
                </h1>
                <p className="hidden sm:block text-slate-600 text-sm md:text-base">
                  Gerencie as avaliações dos alunos
                </p>
              </div>

              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`
                    ${
                      showFilters || hasActiveFilters
                        ? "bg-blue-600 text-white"
                        : "bg-white text-slate-700 border border-slate-300"
                    }
                    hover:opacity-90 rounded-lg flex items-center justify-center gap-2 transition-all
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
                  onClick={() => setCreateExamModal(true)}
                  className="
                    bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2
                    transition-colors text-sm md:text-base
                    w-12 h-12 md:w-auto md:h-auto md:px-4 md:py-2
                  "
                >
                  <Plus className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden sm:inline">Nova Avaliação</span>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Filtrar por nome..."
                      value={filters.name}
                      onChange={(e) =>
                        handleFilterChange("name", e.target.value)
                      }
                      className="w-full pl-3 pr-8 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
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
                      type="date"
                      placeholder="Data inicial"
                      value={filters.startDate}
                      onChange={(e) =>
                        handleFilterChange("startDate", e.target.value)
                      }
                      className="w-full pl-3 pr-8 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    {filters.startDate && (
                      <button
                        onClick={() => handleFilterChange("startDate", "")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <input
                      type="date"
                      placeholder="Data final"
                      value={filters.endDate}
                      onChange={(e) =>
                        handleFilterChange("endDate", e.target.value)
                      }
                      className="w-full pl-3 pr-8 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    {filters.endDate && (
                      <button
                        onClick={() => handleFilterChange("endDate", "")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <select
                      value={filters.teacherId}
                      onChange={(e) =>
                        handleFilterChange("teacherId", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                      <option value="">Todos os professores</option>
                      {/* {teachers.map((teacher: any) => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.name}
                        </option>
                      ))} */}
                    </select>
                  </div>

                  <div className="relative">
                    <select
                      value={filters.type}
                      onChange={(e) =>
                        handleFilterChange("type", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                      <option value="all">Todos os tipos</option>
                      <option value="class">Turma Completa</option>
                      <option value="student">Aluno Específico</option>
                    </select>
                  </div>

                  <button
                    onClick={handleClearFilters}
                    disabled={!hasActiveFilters}
                    className="w-full px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Limpar Filtros
                  </button>
                </div>
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  <p className="text-slate-600 font-medium">
                    Carregando avaliações...
                  </p>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loading && exams.length === 0 && hasActiveFilters && (
              <div className="text-center py-12">
                <Filter className="w-12 h-12 md:w-16 md:h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-600 mb-2">
                  Nenhuma avaliação encontrada
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

            {!loading && exams.length === 0 && !hasActiveFilters && (
              <div className="text-center py-12">
                <ClipboardList className="w-12 h-12 md:w-16 md:h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-600 mb-2">
                  Nenhuma avaliação encontrada
                </h3>
                <p className="text-slate-500 text-sm mb-4">
                  Crie sua primeira avaliação para começar
                </p>
                <button
                  onClick={() => setCreateExamModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors mx-auto text-sm md:text-base"
                >
                  <Plus className="w-4 h-4" />
                  Nova Avaliação
                </button>
              </div>
            )}

            {/* Tabela de Avaliações */}
            {!loading && exams.length > 0 && (
              <div className="relative">
                <div className="md:bg-white md:rounded-xl md:border md:border-slate-200 md:shadow-md md:overflow-hidden">
                  {/* Header da tabela - Desktop */}
                  <div className="hidden md:grid md:grid-cols-12 gap-4 bg-slate-50 px-6 py-4 text-sm font-semibold text-slate-700 uppercase tracking-wide">
                    <div className="col-span-3">Nome</div>
                    <div className="col-span-2">Professor</div>
                    <div className="col-span-2">Tipo</div>
                    <div className="col-span-2">Alvo</div>
                    <div className="col-span-3 text-right">Ações</div>
                  </div>

                  {/* Linhas da tabela */}
                  <div className="flex flex-col gap-3 md:gap-0 md:divide-y md:divide-slate-100">
                    {exams.map((exam: IExam) => {
                      const isClassEvaluation = !!exam.class;

                      return (
                        <div
                          key={exam.id}
                          className="hover:bg-blue-50/40 transition-all duration-200 group"
                        >
                          {/* Layout Mobile */}
                          <div className="md:hidden bg-white rounded-xl shadow-sm border border-slate-200 p-4 hover:shadow-md hover:border-slate-300 transition-all duration-200">
                            {/* Header do Card */}
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
                                  <ClipboardList className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-slate-800 text-sm">
                                    {exam.name}
                                  </h3>
                                  {isClassEvaluation ? (
                                    <span className="text-xs text-blue-600 font-medium">
                                      Turma
                                    </span>
                                  ) : (
                                    <span className="text-xs text-red-600 font-medium">
                                      Aluno
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Info */}
                            <div className="space-y-2 mb-4">
                              <div className="flex items-center gap-2 text-slate-600">
                                <GraduationCap className="w-4 h-4 text-slate-400" />
                                <span className="text-sm">
                                  {exam.teacher.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-slate-600">
                                {isClassEvaluation ? (
                                  <Users className="w-4 h-4 text-slate-400" />
                                ) : (
                                  <User className="w-4 h-4 text-slate-400" />
                                )}
                                <span className="text-sm">
                                  {isClassEvaluation
                                    ? exam.class?.name
                                    : exam.enrollment?.student.name}
                                </span>
                              </div>
                            </div>

                            {/* Ações */}
                            <div className="flex gap-2 pt-2 border-t border-slate-100">
                              <button
                                onClick={() => {
                                  setSelectedExam(exam);
                                  setGradesControlModal(true);
                                }}
                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors text-sm font-medium"
                                title="Controle de Notas"
                              >
                                Notas
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedExam(exam);
                                  setDetailsExamModal(true);
                                }}
                                className="flex items-center justify-center px-3 py-2 text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors"
                                title="Ver detalhes"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedExam(exam);
                                  setUpdateExamModal(true);
                                }}
                                className="flex items-center justify-center px-3 py-2 text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors"
                                title="Editar"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                className="flex items-center justify-center px-3 py-2 text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors"
                                title="Excluir"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Layout Desktop */}
                          <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-5">
                            {/* Nome */}
                            <div className="col-span-3 flex items-center gap-3">
                              {/* <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
                                <ClipboardList className="w-5 h-5 text-white" />
                              </div> */}
                              <div>
                                <h3 className="font-semibold text-slate-800 text-base group-hover:text-blue-700 transition-colors">
                                  {exam.name}
                                </h3>
                                {/* <p className="text-xs text-slate-500 mt-0.5">
                                  {exam.topics.length} tópico(s)
                                </p> */}
                              </div>
                            </div>

                            {/* Professor */}
                            <div className="col-span-2 flex items-center">
                              <div className="flex items-center gap-2 text-sm text-slate-700">
                                <GraduationCap className="w-4 h-4 text-slate-400" />
                                <span className="truncate font-medium">
                                  {exam.teacher.name}
                                </span>
                              </div>
                            </div>

                            {/* Tipo */}
                            <div className="col-span-2 flex items-center">
                              <div className="flex items-center gap-2">
                                {isClassEvaluation ? (
                                  <div className="flex items-center gap-1.5 text-blue-700 px-3 py-1.5 rounded-lg shadow-sm border border-blue-200">
                                    <Users className="w-3.5 h-3.5" />
                                    <span className="text-xs font-semibold">
                                      Turma
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1.5 text-red-700 px-3 py-1.5 rounded-lg shadow-sm border border-red-200">
                                    <User className="w-3.5 h-3.5" />
                                    <span className="text-xs font-semibold">
                                      Aluno
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Alvo */}
                            <div className="col-span-2 flex items-center">
                              <span className="text-sm text-slate-700 truncate font-medium">
                                {isClassEvaluation
                                  ? exam.class?.name
                                  : exam.enrollment?.student.name}
                              </span>
                            </div>

                            {/* Ações */}
                            <div className="col-span-3 flex items-center gap-1.5 justify-end">
                              <button
                                onClick={() => {
                                  setSelectedExam(exam);
                                  setGradesControlModal(true);
                                }}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors shadow-sm hover:shadow border border-transparent hover:border-blue-200"
                                title="Controle de Notas"
                              >
                                <Award className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedExam(exam);
                                  setDetailsExamModal(true);
                                }}
                                className="p-2 text-red-600 hover:bg-blue-50 rounded-lg transition-colors shadow-sm hover:shadow border border-transparent hover:border-red-200"
                                title="Ver detalhes"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedExam(exam);
                                  setUpdateExamModal(true);
                                }}
                                className="p-2 text-blue-600 hover:bg-slate-50 rounded-lg transition-colors shadow-sm hover:shadow border border-transparent hover:border-blue-200"
                                title="Editar"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors shadow-sm hover:shadow border border-transparent hover:border-red-200"
                                title="Excluir"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Paginação */}
                {data && exams.length > 0 && (
                  <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
                    <button
                      onClick={() => {
                        if (currentPage > 1) {
                          setCurrentPage(currentPage - 1);
                          setBefore(data.listExams.startKeyset);
                          setAfter(null);
                        }
                      }}
                      disabled={currentPage <= 1 || loading}
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
                        if (currentPage < getTotalPages()) {
                          setCurrentPage(currentPage + 1);
                          setAfter(data.listExams.endKeyset);
                          setBefore(null);
                        }
                      }}
                      disabled={currentPage >= getTotalPages() || loading}
                      className="flex items-center gap-1.5 px-3 md:px-4 py-2 bg-white border-2 border-slate-300 text-slate-700 rounded-lg hover:border-blue-500 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm font-medium"
                    >
                      <span className="hidden sm:inline">Próxima</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Criação */}
      {createExamModal && (
        <CreateExamModal
          closeCreateExamModal={() => setCreateExamModal(false)}
          refetchExams={refetch}
        />
      )}

      {/* Modal de Detalhes */}
      {detailsExamModal && selectedExam && (
        <ExamDetailsModal
          exam={selectedExam}
          closeExamDetailsModal={() => {
            setDetailsExamModal(false);
            setSelectedExam(null);
          }}
        />
      )}

      {updateExamModal && selectedExam && (
        <UpdateExamModal
          exam={selectedExam}
          closeUpdateExamModal={() => {
            setUpdateExamModal(false);
            setSelectedExam(null);
          }}
          refetchExams={refetch}
        />
      )}

      {gradesControlModal && selectedExam && (
        <GradesControlModal
          exam={selectedExam}
          closeGradesControlModal={() => {
            setGradesControlModal(false);
            setSelectedExam(null);
          }}
          refetchExams={refetch}
        />
      )}
    </div>
  );
};
