import { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  Users,
  BookOpen,
  Plus,
  Filter,
  X,
} from "lucide-react";
import { useQuery } from "@apollo/client/react";
import { Menu } from "../../components/Menu";
import { CreateSchedulingModal } from "../../components/modals/create/CreateSchedulingModal";
import { DetailsSchedulingModal } from "../../components/modals/DetailsSchedulingModal";
import { LIST_CLASSROOMS } from "../../graphql/queries/ListClassrooms";
import { LIST_LESSONS } from "../../graphql/queries/ListLessons";
import type { IClassroom } from "../../interfaces/IClassroom";
import type { ILesson } from "../../interfaces/ILesson";
import { formatDateDisplay } from "../../utils/date";
import { formatDateInput } from "../../utils/date";
import { isToday } from "../../utils/date";

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
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCreateSchedulingModal, setShowCreateSchedulingModal] =
    useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    classroomId: string;
    classroomName: string;
    timeSlot: string;
  } | null>(null);
  const [selectedScheduling, setSelectedScheduling] = useState<ILesson | null>(
    null
  );

  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    className: "",
    teacherName: "",
    classroomName: "",
  });

  const timeSlots: string[] = [];
  for (let hour = 7; hour <= 13; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, "0")}:00`);
  }

  const { data: classroomsData, loading: classroomsLoading } =
    useQuery<ListClassroomsData>(LIST_CLASSROOMS, {
      fetchPolicy: "network-only",
    });

  const startOfDay = new Date(selectedDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(selectedDate);
  endOfDay.setHours(23, 59, 59, 999);

  const {
    data: lessonsData,
    loading: lessonsLoading,
    refetch: refetchLessons,
  } = useQuery<ListLessonsData>(LIST_LESSONS, {
    variables: {
      startDate: startOfDay.toISOString(),
      endDate: endOfDay.toISOString(),
    },
    fetchPolicy: "network-only",
  });

  const classrooms = classroomsData?.listClassrooms?.results || [];
  const allLessons = lessonsData?.listLessons?.results || [];

  const lessons = useMemo(() => {
    return allLessons.filter((lesson) => {
      if (filters.className) {
        const className = lesson.class.name.toLowerCase();
        const searchTerm = filters.className.toLowerCase();
        if (!className.includes(searchTerm)) {
          return false;
        }
      }

      if (filters.teacherName) {
        const teacherName = lesson.teacher.name.toLowerCase();
        const searchTerm = filters.teacherName.toLowerCase();
        if (!teacherName.includes(searchTerm)) {
          return false;
        }
      }

      if (filters.classroomName) {
        const classroomName = lesson.classroom.name.toLowerCase();
        const searchTerm = filters.classroomName.toLowerCase();
        if (!classroomName.includes(searchTerm)) {
          return false;
        }
      }

      return true;
    });
  }, [
    allLessons,
    filters.className,
    filters.teacherName,
    filters.classroomName,
  ]);

  const schedulings: SchedulingsState = {};
  lessons.forEach((lesson) => {
    const lessonDate = new Date(lesson.datetime);
    const timeSlot = `${lessonDate.getHours().toString().padStart(2, "0")}:00`;
    const key = `${lesson.classroom.id}-${timeSlot}`;

    schedulings[key] = { lesson };
  });

  const navigateDate = (direction: number): void => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + direction);
    setSelectedDate(newDate);
  };

  const getSchedulingKey = (classroomId: string, timeSlot: string): string => {
    return `${classroomId}-${timeSlot}`;
  };

  const handleSlotClick = (
    classroomId: string,
    classroomName: string,
    timeSlot: string
  ): void => {
    const key = getSchedulingKey(classroomId, timeSlot);
    const scheduling = schedulings[key];

    if (scheduling) {
      setSelectedScheduling(scheduling.lesson);
      setSelectedSlot({ classroomId, classroomName, timeSlot });
      setShowDetailsModal(true);
    } else {
      setSelectedSlot({ classroomId, classroomName, timeSlot });
      setShowCreateSchedulingModal(true);
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
      className: "",
      teacherName: "",
      classroomName: "",
    });
  };

  const hasActiveFilters =
    filters.className || filters.teacherName || filters.classroomName;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Menu />
      <div
        className="hidden lg:block lg:w-64 xl:w-72 shrink-0"
        aria-hidden="true"
      />
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 p-4 md:p-6 lg:p-8 mt-16 lg:mt-0">
          <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-800 uppercase">
                  Agendamento de Salas
                </h1>
                <p className="text-slate-600 text-sm md:text-base">
                  Gerencie a ocupação das salas por horário
                </p>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`${
                  showFilters || hasActiveFilters
                    ? "bg-blue-600 text-white"
                    : "bg-white text-slate-700 border border-slate-300"
                } hover:opacity-90 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all text-sm md:text-base relative`}
                title="Filtros"
              >
                <Filter className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden sm:inline">Filtros</span>
                {hasActiveFilters && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </button>
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
                      placeholder="Filtrar por turma..."
                      value={filters.className}
                      onChange={(e) =>
                        handleFilterChange("className", e.target.value)
                      }
                      className="w-full pl-3 pr-8 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    {filters.className && (
                      <button
                        onClick={() => handleFilterChange("className", "")}
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
                      value={filters.teacherName}
                      onChange={(e) =>
                        handleFilterChange("teacherName", e.target.value)
                      }
                      className="w-full pl-3 pr-8 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    {filters.teacherName && (
                      <button
                        onClick={() => handleFilterChange("teacherName", "")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Filtrar por sala..."
                      value={filters.classroomName}
                      onChange={(e) =>
                        handleFilterChange("classroomName", e.target.value)
                      }
                      className="w-full pl-3 pr-8 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    {filters.classroomName && (
                      <button
                        onClick={() => handleFilterChange("classroomName", "")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <button
                    onClick={handleClearFilters}
                    disabled={!hasActiveFilters}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Limpar Filtros
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-linear-to-r from-blue-50 to-indigo-50 px-4 md:px-6 py-3 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-semibold text-slate-700">
                      Selecione a Data
                    </span>
                  </div>
                  {isToday(selectedDate) && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-600 text-white">
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
                      className="p-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 hover:border-slate-300 transition-all duration-200 group"
                      title="Dia anterior"
                    >
                      <ChevronLeft className="h-5 w-5 text-slate-600 group-hover:text-slate-900" />
                    </button>

                    <button
                      onClick={() => navigateDate(1)}
                      className="p-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 hover:border-slate-300 transition-all duration-200 group"
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
                        className="pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-slate-400 transition-colors cursor-pointer"
                      />
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>
                    <button
                      onClick={() => setSelectedDate(new Date())}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-semibold shadow-sm hover:shadow-md"
                    >
                      <Clock className="h-4 w-4" />
                      Hoje
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {classroomsLoading ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      Carregando salas...
                    </h3>
                    <p className="text-sm text-slate-600">
                      Buscando informações das salas de aula
                    </p>
                  </div>
                </div>
              </div>
            ) : classrooms.length === 0 ? (
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
                <div className="bg-linear-to-r from-slate-50 to-slate-100 border-b border-slate-200">
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

                <div className="divide-y divide-slate-200 relative">
                  {lessonsLoading && (
                    <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
                      <div className="flex flex-col items-center space-y-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="text-sm text-slate-600">
                          Atualizando agendamentos...
                        </span>
                      </div>
                    </div>
                  )}

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
                        const schedulingKey = getSchedulingKey(
                          classroom.id,
                          timeSlot
                        );
                        const scheduling = schedulings[schedulingKey];

                        return (
                          <div
                            key={timeSlot}
                            className={`p-2 md:p-3 bg-white cursor-pointer transition-all duration-200 min-h-16 md:min-h-20 flex items-center hover:shadow-sm ${
                              scheduling
                                ? "bg-linear-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-l-4 border-blue-500"
                                : "hover:bg-slate-50 border border-transparent hover:border-slate-300 rounded-sm"
                            }`}
                            onClick={() =>
                              handleSlotClick(
                                classroom.id,
                                classroom.name,
                                timeSlot
                              )
                            }
                          >
                            {scheduling ? (
                              <div className="w-full">
                                <div className="flex items-center space-x-1 mb-1">
                                  <BookOpen className="h-3 w-3 text-blue-600 shrink-0" />
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

            {!classroomsLoading && classrooms.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6">
                <h3 className="font-semibold text-slate-900 mb-3 text-sm md:text-base">
                  Legenda
                </h3>
                <div className="flex flex-wrap gap-4 md:gap-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-linear-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 rounded-sm"></div>
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
          </div>
        </div>
      </div>

      {/* Modais */}
      {selectedSlot && (
        <>
          {showCreateSchedulingModal && (
            <CreateSchedulingModal
              onClose={() => {
                setShowCreateSchedulingModal(false);
                setSelectedSlot(null);
              }}
              refetchScheduling={refetchLessons}
              classroomId={selectedSlot.classroomId}
              classroomName={selectedSlot.classroomName}
              timeSlot={selectedSlot.timeSlot}
              date={selectedDate}
            />
          )}

          {showDetailsModal && selectedScheduling && (
            <DetailsSchedulingModal
              onClose={() => {
                setShowDetailsModal(false);
                setSelectedSlot(null);
                setSelectedScheduling(null);
              }}
              scheduling={{
                id: selectedScheduling.id,
                subject: selectedScheduling.class.name,
                teacher: selectedScheduling.teacher.name,
                class: selectedScheduling.class.name,
                datetime: selectedScheduling.datetime,
              }}
              classData={selectedScheduling.class}
              // teacherData={selectedScheduling.teacher}
              // classroomData={selectedScheduling.classroom}
              roomName={selectedSlot.classroomName}
              timeSlot={selectedSlot.timeSlot}
              date={formatDateDisplay(selectedDate)}
              refetchScheduling={refetchLessons}
            />
          )}
        </>
      )}
    </div>
  );
};
