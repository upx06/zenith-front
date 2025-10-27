import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  Users,
  BookOpen,
  Plus,
  Loader2,
  AlertCircle,
  Filter,
  X,
} from "lucide-react";

import { Menu } from "../../components/Menu";
import { CreateSchedulingModal } from "../../components/modals/create/CreateSchedulingModal";
import { DetailsSchedulingModal } from "../../components/modals/DetailsSchedulingModal";
import { ConfirmationModal } from "../../components/modals/ConfirmationModal";

import { LIST_CLASSROOMS } from "../../graphql/queries/ListClassrooms";
import { LIST_LESSONS } from "../../graphql/queries/ListLessons";
import { CREATE_LESSON } from "../../graphql/mutations/CreateLesson";
import { DESTROY_LESSON } from "../../graphql/mutations/DestroyLesson";

import type { IClassroom } from "../../interfaces/IClassroom";
import type { ILesson } from "../../interfaces/ILesson";

interface CreateLessonInput {
  datetime: string;
  classroomId: string;
  teacherId: string;
  classId: string;
}

interface SchedulingsState {
  [key: string]: {
    lesson: ILesson;
  };
}

interface ListClassroomsData {
  listClassrooms: {
    results: IClassroom[];
  };
}

interface ListLessonsData {
  listLessons: {
    results: ILesson[];
  };
}

export const Scheduling = () => {
  // Estados dos modais
  const [createSchedulingModal, setCreateSchedulingModal] = useState(false);
  const [detailsSchedulingModal, setDetailsSchedulingModal] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState(false);

  // Estados de seleção
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<{
    classroomId: string;
    timeSlot: string;
  } | null>(null);
  const [selectedScheduling, setSelectedScheduling] = useState<ILesson | null>(
    null
  );

  // Estados de loading e erro
  const [isProcessing, setIsProcessing] = useState(false);
  const [deletingSchedulingId, setDeletingSchedulingId] = useState<
    string | null
  >(null);

  // Estados de filtros (para futura implementação)
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    classroom: "",
    teacher: "",
    class: "",
  });

  // Queries
  const {
    data: classroomsData,
    loading: classroomsLoading,
    error: classroomsError,
  } = useQuery<ListClassroomsData>(LIST_CLASSROOMS);

  const startOfDay = new Date(selectedDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(selectedDate);
  endOfDay.setHours(23, 59, 59, 999);

  const {
    data: lessonsData,
    loading: lessonsLoading,
    error: lessonsError,
    refetch: refetchLessons,
  } = useQuery<ListLessonsData>(LIST_LESSONS, {
    variables: {
      startDate: startOfDay.toISOString(),
      endDate: endOfDay.toISOString(),
    },
    fetchPolicy: "cache-and-network",
  });

  // Mutations
  const [
    createLesson,
    { loading: loadingCreateLesson, error: errorCreateLesson },
  ] = useMutation(CREATE_LESSON);

  const [
    destroyLesson,
    { loading: loadingDestroyLesson, error: errorDestroyLesson },
  ] = useMutation(DESTROY_LESSON);

  // Dados
  const classrooms = classroomsData?.listClassrooms?.results || [];
  const lessons = lessonsData?.listLessons?.results || [];

  const schedulings: SchedulingsState = {};
  lessons.forEach((lesson) => {
    const lessonDate = new Date(lesson.datetime);
    const timeSlot = `${lessonDate.getHours().toString().padStart(2, "0")}:00`;
    const key = `${lesson.classroom.id}-${timeSlot}`;
    schedulings[key] = { lesson };
  });

  // Handlers
  const handleCreateScheduling = async (
    lessonData: CreateLessonInput
  ): Promise<void> => {
    try {
      setIsProcessing(true);
      await createLesson({
        variables: {
          input: {
            datetime: lessonData.datetime,
            classroomId: lessonData.classroomId,
            teacherId: lessonData.teacherId,
            classId: lessonData.classId,
          },
        },
      });

      await refetchLessons();
      setCreateSchedulingModal(false);
      setSelectedSlot(null);
    } catch (err) {
      console.error("Erro ao criar aula:", err);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteScheduling = async (id: string) => {
    setDeletingSchedulingId(id);
    try {
      await destroyLesson({
        variables: { id },
      });
      await refetchLessons();
      setConfirmationModal(false);
      setSelectedScheduling(null);
    } catch (err) {
      console.error("Erro ao excluir agendamento:", err);
    } finally {
      setDeletingSchedulingId(null);
    }
  };

  const handleOpenConfirmationModal = (scheduling: ILesson) => {
    setSelectedScheduling(scheduling);
    setConfirmationModal(true);
  };

  const handleOpenDetailsModal = (scheduling: ILesson) => {
    setSelectedScheduling(scheduling);
    setDetailsSchedulingModal(true);
  };

  const handleSlotClick = (classroomId: string, timeSlot: string): void => {
    const key = `${classroomId}-${timeSlot}`;
    const scheduling = schedulings[key];

    if (scheduling) {
      handleOpenDetailsModal(scheduling.lesson);
    } else {
      setSelectedSlot({ classroomId, timeSlot });
      setCreateSchedulingModal(true);
    }
  };

  const handleFilterChange = (field: keyof typeof filters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      classroom: "",
      teacher: "",
      class: "",
    });
  };

  // Utils
  const timeSlots: string[] = [];
  for (let hour = 7; hour <= 13; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, "0")}:00`);
  }

  const formatDateInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const navigateDate = (direction: number): void => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + direction);
    setSelectedDate(newDate);
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getClassroomName = (classroomId: string): string => {
    return (
      classrooms.find((classroom) => classroom.id === classroomId)?.name ||
      "Sala não encontrada"
    );
  };

  const hasActiveFilters =
    filters.classroom || filters.teacher || filters.class;
  const isLoadingData = classroomsLoading || lessonsLoading;

  // Tratamento de erros
  if (classroomsError || lessonsError) {
    const error = classroomsError || lessonsError;
    return (
      <div className="min-h-screen bg-slate-50 flex">
        <Menu />
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="text-center max-w-md">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-600 mb-2">
              Erro ao carregar dados
            </h2>
            <p className="text-slate-600 mb-6">{error?.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Recarregar página
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
        {/* Overlay de loading durante processamento */}
        {isProcessing && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-slate-600 font-medium">Processando...</p>
            </div>
          </div>
        )}

        <div className="flex-1 p-4 md:p-6 lg:p-8 mt-16 lg:mt-0">
          {/* Mensagens de erro */}
          {(errorCreateLesson || errorDestroyLesson) && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800 mb-2">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium">
                  {errorCreateLesson
                    ? "Erro ao criar agendamento:"
                    : "Erro ao excluir agendamento:"}
                </span>
              </div>
              <p className="text-red-700 text-sm mb-3">
                {(errorCreateLesson || errorDestroyLesson)?.message}
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
            {/* Header */}
            <div className="flex flex-row justify-between gap-4 pt-5 md:pt-0">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-800 uppercase">
                  Agendamento de Salas
                </h1>
                <p className="text-slate-600 text-sm md:text-base">
                  Gerencie a ocupação das salas por horário
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
                  onClick={() => {
                    setSelectedSlot(null);
                    setCreateSchedulingModal(true);
                  }}
                  disabled={isProcessing}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm md:text-base"
                >
                  <Plus className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden sm:inline">Novo Agendamento</span>
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
                      placeholder="Filtrar por sala..."
                      value={filters.classroom}
                      onChange={(e) =>
                        handleFilterChange("classroom", e.target.value)
                      }
                      disabled={isProcessing}
                      className="w-full pl-3 pr-8 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    {filters.classroom && (
                      <button
                        onClick={() => handleFilterChange("classroom", "")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Filtrar por professor..."
                      value={filters.teacher}
                      onChange={(e) =>
                        handleFilterChange("teacher", e.target.value)
                      }
                      disabled={isProcessing}
                      className="w-full pl-3 pr-8 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    {filters.teacher && (
                      <button
                        onClick={() => handleFilterChange("teacher", "")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Filtrar por turma..."
                      value={filters.class}
                      onChange={(e) =>
                        handleFilterChange("class", e.target.value)
                      }
                      disabled={isProcessing}
                      className="w-full pl-3 pr-8 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    {filters.class && (
                      <button
                        onClick={() => handleFilterChange("class", "")}
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

            {/* Seletor de Data */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-blue-600 px-4 md:px-6 py-3 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-white" />
                    <span className="text-sm font-semibold text-white">
                      Selecione a Data
                    </span>
                  </div>
                  {isToday(selectedDate) && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500 text-white">
                      Hoje
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <div className="flex items-center gap-2 order-2 md:order-1">
                    <button
                      onClick={() => navigateDate(-1)}
                      disabled={isProcessing}
                      className="p-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 hover:border-slate-300 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Dia anterior"
                    >
                      <ChevronLeft className="h-5 w-5 text-slate-600 group-hover:text-slate-900" />
                    </button>

                    <button
                      onClick={() => navigateDate(1)}
                      disabled={isProcessing}
                      className="p-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 hover:border-slate-300 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Próximo dia"
                    >
                      <ChevronRight className="h-5 w-5 text-slate-600 group-hover:text-slate-900" />
                    </button>
                  </div>

                  <div className="flex-1 text-center order-1 md:order-2">
                    <div className="text-xl md:text-2xl font-bold text-slate-900 capitalize mb-1">
                      {selectedDate.toLocaleDateString("pt-BR", {
                        weekday: "long",
                      })}
                    </div>
                    <div className="text-base md:text-lg text-slate-600 font-medium">
                      {selectedDate.toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 order-3">
                    <div className="relative">
                      <input
                        type="date"
                        value={formatDateInput(selectedDate)}
                        onChange={(e) => {
                          const newDate = new Date(
                            e.target.value + "T12:00:00"
                          );
                          setSelectedDate(newDate);
                        }}
                        disabled={isProcessing}
                        className="pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-slate-400 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>
                    <button
                      onClick={() => setSelectedDate(new Date())}
                      disabled={isProcessing}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-semibold shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Clock className="h-4 w-4" />
                      Hoje
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Grade de Agendamentos */}
            <div className="relative min-h-[200px]">
              {isLoadingData && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    <p className="text-slate-600 font-medium">
                      Carregando agendamentos...
                    </p>
                  </div>
                </div>
              )}

              {classrooms.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                      <BookOpen className="h-8 w-8 text-slate-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">
                        Nenhuma sala cadastrada
                      </h3>
                      <p className="text-sm text-slate-600">
                        Cadastre salas para começar a fazer agendamentos
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="bg-blue-600 border-b border-slate-200">
                    <div
                      className="grid gap-px"
                      style={{
                        gridTemplateColumns: `200px repeat(${timeSlots.length}, minmax(120px, 1fr))`,
                      }}
                    >
                      <div className="p-3 md:p-4 bg-white">
                        <div className="flex items-center space-x-2">
                          <BookOpen className="h-4 w-4 text-slate-500" />
                          <span className="font-semibold text-slate-900 text-sm md:text-base">
                            Salas
                          </span>
                        </div>
                      </div>
                      {timeSlots.map((timeSlot) => (
                        <div
                          key={timeSlot}
                          className="p-3 md:p-4 bg-white text-center"
                        >
                          <div className="flex items-center justify-center space-x-1">
                            <Clock className="h-3 w-3 text-slate-500" />
                            <span className="text-sm font-semibold text-slate-900">
                              {timeSlot}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="divide-y divide-slate-200">
                    {classrooms.map((classroom) => (
                      <div
                        key={classroom.id}
                        className="grid gap-px bg-slate-200"
                        style={{
                          gridTemplateColumns: `200px repeat(${timeSlots.length}, minmax(120px, 1fr))`,
                        }}
                      >
                        <div className="p-3 md:p-4 bg-white flex flex-col justify-center border-r border-slate-100">
                          <div className="text-sm font-semibold text-slate-900">
                            {classroom.name}
                          </div>
                          <div className="text-xs text-slate-500 mt-1 flex items-center space-x-1">
                            <Users className="h-3 w-3" />
                            <span>{classroom.capacity} lugares</span>
                          </div>
                        </div>

                        {timeSlots.map((timeSlot) => {
                          const schedulingKey = `${classroom.id}-${timeSlot}`;
                          const scheduling = schedulings[schedulingKey];

                          return (
                            <div
                              key={timeSlot}
                              className={`p-2 md:p-3 bg-white cursor-pointer transition-all duration-200 min-h-16 md:min-h-20 flex items-center hover:shadow-sm ${
                                scheduling
                                  ? "bg-blue-50 hover:bg-blue-100 border-l-4 border-blue-500"
                                  : "hover:bg-slate-50 border border-transparent hover:border-slate-300 rounded-sm"
                              } ${
                                isProcessing
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                              onClick={() =>
                                !isProcessing &&
                                handleSlotClick(classroom.id, timeSlot)
                              }
                            >
                              {scheduling ? (
                                <div className="w-full">
                                  <div className="flex items-center space-x-1 mb-1">
                                    <BookOpen className="h-3 w-3 text-blue-600 flex-shrink-0" />
                                    <span className="text-xs font-semibold text-blue-900 truncate">
                                      {scheduling.lesson.class.name}
                                    </span>
                                  </div>
                                  <div className="text-xs text-slate-600 truncate">
                                    {scheduling.lesson.teacher.name}
                                  </div>
                                </div>
                              ) : (
                                <div className="w-full h-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                  <Plus className="h-4 w-4 text-slate-400" />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Legenda */}
            {classrooms.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6">
                <h3 className="font-semibold text-slate-900 mb-3 text-sm md:text-base">
                  Legenda
                </h3>
                <div className="flex flex-wrap gap-4 md:gap-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-blue-50 border-l-4 border-blue-500 rounded-sm"></div>
                    <span className="text-sm text-slate-600">Ocupado</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-white border border-slate-200 rounded-sm"></div>
                    <span className="text-sm text-slate-600">Disponível</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Plus className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-600">
                      Clique para agendar
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Estados vazios */}
            {classrooms.length === 0 && !isLoadingData && (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 md:w-16 md:h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-600 mb-2">
                  Nenhuma sala cadastrada
                </h3>
                <p className="text-slate-500 text-sm mb-4">
                  Cadastre salas para começar a fazer agendamentos
                </p>
              </div>
            )}

            {classrooms.length > 0 &&
              lessons.length === 0 &&
              !hasActiveFilters &&
              !isLoadingData && (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 md:w-16 md:h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-600 mb-2">
                    Nenhum agendamento encontrado
                  </h3>
                  <p className="text-slate-500 text-sm mb-4">
                    Clique em "Novo Agendamento" para criar seu primeiro
                    agendamento
                  </p>
                  <button
                    onClick={() => {
                      setSelectedSlot(null);
                      setCreateSchedulingModal(true);
                    }}
                    disabled={isProcessing}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors mx-auto text-sm md:text-base"
                  >
                    <Plus className="w-4 h-4" />
                    Novo Agendamento
                  </button>
                </div>
              )}

            {classrooms.length > 0 &&
              lessons.length === 0 &&
              hasActiveFilters &&
              !isLoadingData && (
                <div className="text-center py-12">
                  <Filter className="w-12 h-12 md:w-16 md:h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-600 mb-2">
                    Nenhum agendamento encontrado
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
          </div>
        </div>
      </div>

      {/* Modais */}
      {createSchedulingModal && (
        <CreateSchedulingModal
          isOpen={createSchedulingModal}
          onClose={() => {
            setCreateSchedulingModal(false);
            setSelectedSlot(null);
          }}
          onSubmit={handleCreateScheduling}
          roomName={
            selectedSlot ? getClassroomName(selectedSlot.classroomId) : ""
          }
          classroomId={selectedSlot?.classroomId}
          timeSlot={selectedSlot?.timeSlot}
          date={selectedDate}
          isLoading={loadingCreateLesson}
        />
      )}

      {detailsSchedulingModal && selectedScheduling && (
        <DetailsSchedulingModal
          lesson={selectedScheduling}
          closeDetailsSchedulingModal={() => {
            setDetailsSchedulingModal(false);
            setSelectedScheduling(null);
          }}
          onEdit={() => {
            // Implementar edição se necessário
            console.log("Editar agendamento:", selectedScheduling);
          }}
          onDelete={() => handleOpenConfirmationModal(selectedScheduling)}
          isLoading={loadingDestroyLesson}
        />
      )}

      {confirmationModal && selectedScheduling && (
        <ConfirmationModal
          onClose={() => {
            if (!loadingDestroyLesson) {
              setConfirmationModal(false);
              setSelectedScheduling(null);
            }
          }}
          onConfirm={() => handleDeleteScheduling(selectedScheduling.id)}
          title="Excluir Agendamento"
          message={`Tem certeza que deseja excluir o agendamento da turma ${selectedScheduling.class.name}?`}
          confirmText={loadingDestroyLesson ? "Excluindo..." : "Confirmar"}
          cancelText="Cancelar"
          isLoading={loadingDestroyLesson}
          isDisabled={loadingDestroyLesson}
        />
      )}
    </div>
  );
};
