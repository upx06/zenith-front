import {
  X,
  School,
  Users,
  Calendar,
  Clock,
  User,
  BookOpen,
} from "lucide-react";
import { format, isFuture, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { IClassroom } from "../../interfaces/IClassroom";
import { useTranslation } from "react-i18next";

interface IClassroomDetailsModal {
  classroom: IClassroom;
  closeClassroomDetailsModal: () => void;
}

export const ClassroomDetailsModal = ({
  classroom,
  closeClassroomDetailsModal,
}: IClassroomDetailsModal) => {
  const { t } = useTranslation();
  const futureLessons =
    classroom.lesson
      ?.filter((lesson) => isFuture(parseISO(lesson.datetime)))
      .sort(
        (a, b) =>
          new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
      ) || [];

  const formatDateTime = (datetime: string) => {
    const date = parseISO(datetime);
    return {
      date: format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }),
      time: format(date, "HH:mm", { locale: ptBR }),
      dayOfWeek: format(date, "EEEE", { locale: ptBR }),
    };
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-blue-600 dark:bg-blue-500 p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                <School className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{classroom.name}</h2>
                <p className="text-blue-100 mt-1">
                  {t("classroom.detailClassroomModal.title")}
                </p>
              </div>
            </div>
            <button
              onClick={closeClassroomDetailsModal}
              className="text-white/80 hover:text-white transition-colors p-1"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
              <School className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              {t("classroom.detailClassroomModal.info")}
            </h3>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="font-medium">
                  {t("classroom.detailClassroomModal.capacity")}:
                </span>
                <span className="text-slate-600 dark:text-slate-300">
                  {classroom.capacity}{" "}
                  {t("classroom.detailClassroomModal.students")}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              {t("classroom.detailClassroomModal.nextLessons")}
              <span className="text-sm font-normal text-slate-500 dark:text-slate-400 ml-1">
                ({futureLessons.length})
              </span>
            </h3>

            {futureLessons.length === 0 ? (
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-8 text-center border border-slate-200 dark:border-slate-700">
                <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-slate-600 dark:text-slate-300 font-medium">
                  {t("classroom.detailClassroomModal.none")}
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                  {t("classroom.detailClassroomModal.noneLabel")}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {futureLessons.map((lesson) => {
                  const { time, dayOfWeek } = formatDateTime(lesson.datetime);
                  return (
                    <div
                      key={lesson.id}
                      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-400 transition-all"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex flex-col items-center justify-center shrink-0">
                            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase">
                              {format(parseISO(lesson.datetime), "MMM", {
                                locale: ptBR,
                              })}
                            </span>
                            <span className="text-xl font-bold text-blue-700 dark:text-blue-300">
                              {format(parseISO(lesson.datetime), "dd")}
                            </span>
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Clock className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                              <span className="font-semibold text-slate-800 dark:text-white">
                                {time}
                              </span>
                              <span className="text-slate-500 dark:text-slate-400 text-sm">
                                • {dayOfWeek}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 mb-1">
                              <BookOpen className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                              <span className="font-medium">
                                {lesson.class.name}
                              </span>
                              <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded text-xs font-medium">
                                {lesson.class.level}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                              <User className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                              <span>{lesson.teacher.name}</span>
                              {lesson.teacher.phone && (
                                <>
                                  <span className="text-slate-400 dark:text-slate-500">
                                    •
                                  </span>
                                  <span className="text-slate-500 dark:text-slate-400">
                                    {lesson.teacher.phone}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
