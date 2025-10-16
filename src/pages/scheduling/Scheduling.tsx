import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  Users,
  BookOpen,
  Plus,
} from "lucide-react";
import { useQuery, useMutation } from "@apollo/client/react";
import { Menu } from "../../components/Menu";
import { CreateSchedulingModal } from "../../components/modals/CreateSchedulingModal";
import { DetailsSchedulingModal } from "../../components/modals/DetailsSchedulingModal";
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
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCreateSchedulingModal, setShowCreateSchedulingModal] =
    useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    classroomId: string;
    timeSlot: string;
  } | null>(null);
  const [selectedScheduling, setSelectedScheduling] = useState<ILesson | null>(
    null
  );

  const timeSlots: string[] = [];
  for (let hour = 7; hour <= 13; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, "0")}:00`);
  }

  const { data: classroomsData, loading: classroomsLoading } =
    useQuery<ListClassroomsData>(LIST_CLASSROOMS);

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

  const [createLesson] = useMutation(CREATE_LESSON);
  const [destroyLesson] = useMutation(DESTROY_LESSON);

  const classrooms = classroomsData?.listClassrooms?.results || [];
  const lessons = lessonsData?.listLessons?.results || [];

  const schedulings: SchedulingsState = {};
  lessons.forEach((lesson) => {
    const lessonDate = new Date(lesson.datetime);
    const timeSlot = `${lessonDate.getHours().toString().padStart(2, "0")}:00`;
    const key = `${lesson.classroom.id}-${timeSlot}`;

    schedulings[key] = { lesson };
  });

  const formatDateInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatDateDisplay = (date: Date): string => {
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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

  const getSchedulingKey = (classroomId: string, timeSlot: string): string => {
    return `${classroomId}-${timeSlot}`;
  };

  const handleSlotClick = (classroomId: string, timeSlot: string): void => {
    const key = getSchedulingKey(classroomId, timeSlot);
    const scheduling = schedulings[key];

    if (scheduling) {
      setSelectedScheduling(scheduling.lesson);
      setSelectedSlot({ classroomId, timeSlot });
      setShowDetailsModal(true);
    } else {
      setSelectedSlot({ classroomId, timeSlot });
      setShowCreateSchedulingModal(true);
    }
  };

  const handleCreateScheduling = async (
    lessonData: CreateLessonInput
  ): Promise<void> => {
    try {
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
      setShowCreateSchedulingModal(false);
      setSelectedSlot(null);
    } catch (err) {
      console.error("Erro ao criar aula:", err);
      throw err;
    }
  };

  const handleDeleteScheduling = async (): Promise<void> => {
    if (!selectedScheduling) return;

    try {
      await destroyLesson({
        variables: {
          id: selectedScheduling.id,
        },
      });

      await refetchLessons();
      setShowDetailsModal(false);
      setSelectedSlot(null);
      setSelectedScheduling(null);
    } catch (err) {
      console.error("Erro ao excluir aula:", err);
    }
  };

  const handleEditScheduling = (): void => {
    setShowDetailsModal(false);
    setShowCreateSchedulingModal(true);
  };

  const getClassroomName = (classroomId: string): string => {
    return (
      classrooms.find((classroom) => classroom.id === classroomId)?.name ||
      "Sala não encontrada"
    );
  };

  const handleCloseCreateSchedulingModal = (): void => {
    setShowCreateSchedulingModal(false);
    setSelectedSlot(null);
  };

  const handleCloseDetailsModal = (): void => {
    setShowDetailsModal(false);
    setSelectedSlot(null);
    setSelectedScheduling(null);
  };

  if (classroomsLoading || lessonsLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex">
        <Menu />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Carregando agendamentos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Menu />
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
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 md:px-6 py-3 border-b border-slate-200">
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
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
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
                                ? "bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-l-4 border-blue-500"
                                : "hover:bg-slate-50 border border-transparent hover:border-slate-300 rounded-sm"
                            }`}
                            onClick={() =>
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

            {classrooms.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6">
                <h3 className="font-semibold text-slate-900 mb-3 text-sm md:text-base">
                  Legenda
                </h3>
                <div className="flex flex-wrap gap-4 md:gap-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 rounded-sm"></div>
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
          <CreateSchedulingModal
            isOpen={showCreateSchedulingModal}
            onClose={handleCloseCreateSchedulingModal}
            onSubmit={handleCreateScheduling}
            roomName={getClassroomName(selectedSlot.classroomId)}
            classroomId={selectedSlot.classroomId}
            timeSlot={selectedSlot.timeSlot}
            date={selectedDate}
          />

          {selectedScheduling && (
            <DetailsSchedulingModal
              isOpen={showDetailsModal}
              onClose={handleCloseDetailsModal}
              onEdit={handleEditScheduling}
              onDelete={handleDeleteScheduling}
              scheduling={{
                subject: selectedScheduling.class.name,
                teacher: selectedScheduling.teacher.name,
                class: selectedScheduling.class.name,
                datetime: selectedScheduling.datetime,
              }}
              classData={selectedScheduling.class}
              roomName={getClassroomName(selectedSlot.classroomId)}
              timeSlot={selectedSlot.timeSlot}
              date={formatDateDisplay(selectedDate)}
            />
          )}
        </>
      )}
    </div>
  );
};
