import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Calendar,
  Clock,
  Users,
  BookOpen,
  Filter,
  X,
  ClipboardCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Menu } from "../../components/Menu";
import { AttendanceModal } from "../../components/modals/AttendanceModal";
import type { ILesson } from "../../interfaces/ILesson";
import type { IListFrequencies } from "../../interfaces/IListFrequencies";
import { LIST_ALL_LESSONS } from "../../graphql/queries/ListAllLessons";
import { LIST_FREQUENCIES } from "../../graphql/queries/ListFrequencies";

interface IListLessons {
  listLessons: {
    count: number;
    endKeyset: string;
    startKeyset: string;
    results: ILesson[];
  };
}

export const Frequency = () => {
  const [selectedLesson, setSelectedLesson] = useState<ILesson | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    teacherId: "",
    status: "all", // all, pending, completed
  });

  const [after, setAfter] = useState<string | null>(null);
  const [before, setBefore] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Buscar todas as lessons
  const { data, loading, error, refetch } = useQuery<IListLessons>(
    LIST_ALL_LESSONS,
    {
      variables: {
        after: after || undefined,
        before: before || undefined,
        filter: buildLessonFilter(),
      },
      fetchPolicy: "cache-and-network",
    }
  );

  // Buscar todas as frequências
  const { data: frequenciesData, refetch: refetchFrequencies } =
    useQuery<IListFrequencies>(LIST_FREQUENCIES, {
      fetchPolicy: "cache-and-network",
    });

  function buildLessonFilter() {
    const filter: any = {};

    if (filters.startDate && filters.endDate) {
      filter.and = [
        {
          datetime: {
            greaterThanOrEqual: new Date(filters.startDate).toISOString(),
          },
        },
        {
          datetime: {
            lessThanOrEqual: new Date(
              filters.endDate + "T23:59:59"
            ).toISOString(),
          },
        },
      ];
    } else if (filters.startDate) {
      filter.datetime = {
        greaterThanOrEqual: new Date(filters.startDate).toISOString(),
      };
    } else if (filters.endDate) {
      filter.datetime = {
        lessThanOrEqual: new Date(filters.endDate + "T23:59:59").toISOString(),
      };
    }

    if (filters.teacherId) {
      filter.teacherId = { eq: filters.teacherId };
    }

    if (filters.status === "pending") {
      filter.attendanceTaken = { eq: false };
    } else if (filters.status === "completed") {
      filter.attendanceTaken = { eq: true };
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
      startDate: "",
      endDate: "",
      teacherId: "",
      status: "all",
    });
    setCurrentPage(1);
    setAfter(null);
    setBefore(null);
  };

  const handleLessonClick = (lesson: ILesson) => {
    setSelectedLesson(lesson);
  };

  const handleCloseModal = () => {
    setSelectedLesson(null);
  };

  const handleSuccess = () => {
    refetch();
    refetchFrequencies();
  };

  const hasActiveFilters =
    filters.startDate ||
    filters.endDate ||
    filters.teacherId ||
    filters.status !== "all";

  const lessons = data?.listLessons?.results || [];

  // Obter frequências existentes para a aula selecionada
  const existingFrequencies = selectedLesson
    ? (frequenciesData?.listFrequencies?.results || []).filter(
        (freq: any) => freq.lessonId === selectedLesson.id
      )
    : [];

  // Obter lista única de professores para o filtro
  const teachers = Array.from(
    new Map(
      lessons.map((lesson) => [lesson.teacher.id, lesson.teacher])
    ).values()
  );

  const getTotalPages = () => {
    if (!data) return 1;
    const totalPages = Math.ceil(data.listLessons.count / itemsPerPage);
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
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-5 md:pt-0">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-800 uppercase">
                  Frequências
                </h1>
                <p className="text-slate-600 text-sm md:text-base">
                  Registre a presença dos alunos nas aulas
                </p>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`${
                  showFilters || hasActiveFilters
                    ? "bg-blue-600 text-white"
                    : "bg-white text-slate-700 border border-slate-300"
                } hover:opacity-90 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all text-sm md:text-base relative`}
              >
                <Filter className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden sm:inline">Filtros</span>
                {hasActiveFilters && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </button>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  <div className="relative">
                    <input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) =>
                        handleFilterChange("startDate", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>

                  <div className="relative">
                    <input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) =>
                        handleFilterChange("endDate", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>

                  <div className="relative">
                    <select
                      value={filters.teacherId}
                      onChange={(e) =>
                        handleFilterChange("teacherId", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                      <option value="">Todos</option>
                      {teachers.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="relative">
                    <select
                      value={filters.status}
                      onChange={(e) =>
                        handleFilterChange("status", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                      <option value="all">Todos</option>
                      <option value="pending">Pendentes</option>
                      <option value="completed">Concluídas</option>
                    </select>
                  </div>
                  <div>
                    <button
                      onClick={handleClearFilters}
                      disabled={!hasActiveFilters}
                      className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Limpar Filtros
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  <p className="text-slate-600 font-medium">
                    Carregando aulas...
                  </p>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loading && lessons.length === 0 && hasActiveFilters && (
              <div className="text-center py-12">
                <Filter className="w-12 h-12 md:w-16 md:h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-600 mb-2">
                  Nenhuma aula encontrada
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

            {!loading && lessons.length === 0 && !hasActiveFilters && (
              <div className="text-center py-12">
                <ClipboardCheck className="w-12 h-12 md:w-16 md:h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-600 mb-2">
                  Nenhuma aula encontrada
                </h3>
                <p className="text-slate-500 text-sm">
                  Não há aulas cadastradas no sistema
                </p>
              </div>
            )}

            {/* Tabela de Aulas */}
            {!loading && lessons.length > 0 && (
              <div className="relative">
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                  {/* Header da tabela - Desktop */}
                  <div className="hidden md:grid md:grid-cols-12 gap-4 bg-slate-50 border-b border-slate-200 px-4 md:px-6 py-3 text-sm font-semibold text-slate-700">
                    <div className="col-span-1 flex items-center justify-center">
                      Status
                    </div>
                    <div className="col-span-3">Turma</div>
                    <div className="col-span-2">Data/Hora</div>
                    <div className="col-span-3">Professor</div>
                    <div className="col-span-2">Alunos</div>
                    <div className="col-span-1"></div>
                  </div>

                  {/* Linhas da tabela */}
                  <div className="divide-y divide-slate-100">
                    {lessons.map((lesson) => {
                      const lessonDate = new Date(lesson.datetime);
                      const enrollments = lesson.class.enrollments || [];
                      const isPast = lessonDate < new Date();

                      return (
                        <div
                          key={lesson.id}
                          onClick={() => handleLessonClick(lesson)}
                          className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-4 md:px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          {/* Status */}
                          <div className="col-span-1 flex items-center justify-start md:justify-center">
                            <div className="flex items-center gap-2">
                              {lesson.attendanceTaken ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  <span className="text-xs font-medium text-green-700 md:hidden">
                                    Chamada Feita
                                  </span>
                                  <CheckCircle2 className="w-5 h-5 text-green-600 hidden md:block" />
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                                  <span className="text-xs font-medium text-amber-700 md:hidden">
                                    Pendente
                                  </span>
                                  <ClipboardCheck className="w-5 h-5 text-amber-600 hidden md:block" />
                                </div>
                              )}
                              {isPast && !lesson.attendanceTaken && (
                                <XCircle className="w-4 h-4 text-red-500" />
                              )}
                            </div>
                          </div>

                          {/* Turma */}
                          <div className="col-span-3 flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-full hidden md:flex items-center justify-center shrink-0">
                              <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-slate-800 text-sm md:text-base">
                                {lesson.class.name}
                              </h3>
                              <p className="text-xs md:text-sm text-slate-600">
                                {lesson.class.level} -{" "}
                                {lesson.class.language.name}
                              </p>
                            </div>
                          </div>

                          {/* Data/Hora */}
                          <div className="col-span-2 flex flex-col justify-center">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Calendar className="w-4 h-4 text-slate-400" />
                              {lessonDate.toLocaleDateString("pt-BR")}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                              <Clock className="w-4 h-4 text-slate-400" />
                              {lessonDate.toLocaleTimeString("pt-BR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>

                          {/* Professor */}
                          <div className="col-span-3 flex items-center">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Users className="w-4 h-4 text-slate-400" />
                              <span className="truncate">
                                {lesson.teacher.name}
                              </span>
                            </div>
                          </div>

                          {/* Alunos */}
                          <div className="col-span-2 flex items-center">
                            <div className="flex items-center gap-2">
                              <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                                {enrollments.length} aluno(s)
                              </div>
                            </div>
                          </div>

                          {/* Ação */}
                          <div className="col-span-1 flex items-center justify-end">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLessonClick(lesson);
                              }}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium hidden md:block"
                            >
                              {lesson.attendanceTaken ? "Editar" : "Registrar"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Paginação */}
                {data && lessons.length > 0 && (
                  <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
                    <button
                      onClick={() => {
                        if (currentPage > 1) {
                          setCurrentPage(currentPage - 1);
                          setBefore(data.listLessons.startKeyset);
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
                          setAfter(data.listLessons.endKeyset);
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

      {/* Modal de Presença */}
      {selectedLesson && (
        <AttendanceModal
          lesson={selectedLesson}
          onClose={handleCloseModal}
          onSuccess={handleSuccess}
          existingFrequencies={existingFrequencies}
        />
      )}
    </div>
  );
};
