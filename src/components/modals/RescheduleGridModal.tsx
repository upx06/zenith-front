import { useMutation, useLazyQuery } from "@apollo/client/react";
import {
  X,
  Loader2,
  AlertCircle,
  Calendar,
  Copy,
  CalendarDays,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { CREATE_LESSON } from "../../graphql/mutations/create/CreateLesson";
import { DESTROY_LESSON } from "../../graphql/mutations/destroy/DestroyLesson";
import { LIST_LESSONS } from "../../graphql/queries/ListLessons";
import type { ILesson } from "../../interfaces/ILesson";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

interface ListLessonsData {
  listLessons: {
    results: ILesson[];
  };
}

interface RescheduleGridModalProps {
  onClose: () => void;
  refetchScheduling: () => void;
}

type RescheduleType = "daily" | "weekly";
type Step = "type" | "dates" | "confirmation";

export const RescheduleGridModal = ({
  onClose,
  refetchScheduling,
}: RescheduleGridModalProps) => {
  const { t, i18n } = useTranslation();
  const [step, setStep] = useState<Step>("type");
  const [rescheduleType, setRescheduleType] = useState<RescheduleType>("daily");
  const [sourceDate, setSourceDate] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [targetLessonsCount, setTargetLessonsCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const [createLesson] = useMutation(CREATE_LESSON);
  const [destroyLesson] = useMutation(DESTROY_LESSON);
  const [fetchLessons] = useLazyQuery<ListLessonsData>(LIST_LESSONS);

  const locale = i18n.language === "pt-BR" ? "pt-BR" : "en-US";

  // Calcular o domingo da semana para uma data
  const getSunday = (date: Date): Date => {
    const day = date.getDay();
    const diff = date.getDate() - day;
    return new Date(date.setDate(diff));
  };

  // Pegar todas as datas da semana (domingo a sábado)
  const getWeekDates = (sunday: Date): Date[] => {
    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(sunday);
      date.setDate(sunday.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const handleTypeSelect = (type: RescheduleType) => {
    setRescheduleType(type);
    setStep("dates");
  };

  const handleCheckTargetLessons = async () => {
    if (!targetDate) return;

    setIsProcessing(true);

    try {
      let totalCount = 0;

      if (rescheduleType === "daily") {
        const target = new Date(targetDate + "T00:00:00");
        const startOfDay = new Date(target);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(target);
        endOfDay.setHours(23, 59, 59, 999);

        const { data } = await fetchLessons({
          variables: {
            startDate: startOfDay.toISOString(),
            endDate: endOfDay.toISOString(),
          },
        });

        totalCount = data?.listLessons?.results?.length || 0;
      } else {
        const targetWeekStart = getSunday(new Date(targetDate + "T00:00:00"));
        const targetWeekDates = getWeekDates(targetWeekStart);

        for (const day of targetWeekDates) {
          const startOfDay = new Date(day);
          startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date(day);
          endOfDay.setHours(23, 59, 59, 999);

          const { data } = await fetchLessons({
            variables: {
              startDate: startOfDay.toISOString(),
              endDate: endOfDay.toISOString(),
            },
          });

          totalCount += data?.listLessons?.results?.length || 0;
        }
      }

      setTargetLessonsCount(totalCount);
      setStep("confirmation");
    } catch (error) {
      console.error("Erro ao verificar aulas de destino:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReschedule = async () => {
    if (!sourceDate || !targetDate) {
      return;
    }

    setIsProcessing(true);

    try {
      if (rescheduleType === "daily") {
        await rescheduleDailyGrid();
        toast.success(t("schedule.rescheduleGridModal.toast.dailySuccess"));
      } else {
        await rescheduleWeeklyGrid();
        toast.success(t("schedule.rescheduleGridModal.toast.weeklySuccess"));
      }

      refetchScheduling();
      onClose();
    } catch (error: any) {
      console.error("Erro ao reagendar:", error);
      toast.error(
        error?.message || t("schedule.rescheduleGridModal.toast.error")
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const rescheduleDailyGrid = async () => {
    const source = new Date(sourceDate + "T00:00:00");
    const target = new Date(targetDate + "T00:00:00");

    const startOfDay = new Date(source);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(source);
    endOfDay.setHours(23, 59, 59, 999);

    const { data } = await fetchLessons({
      variables: {
        startDate: startOfDay.toISOString(),
        endDate: endOfDay.toISOString(),
      },
    });

    const sourceLessons = data?.listLessons?.results || [];

    const targetStartOfDay = new Date(target);
    targetStartOfDay.setHours(0, 0, 0, 0);
    const targetEndOfDay = new Date(target);
    targetEndOfDay.setHours(23, 59, 59, 999);

    const { data: targetData } = await fetchLessons({
      variables: {
        startDate: targetStartOfDay.toISOString(),
        endDate: targetEndOfDay.toISOString(),
      },
    });

    const targetLessons = targetData?.listLessons?.results || [];

    for (const lesson of targetLessons) {
      await destroyLesson({
        variables: { id: lesson.id },
      });
    }

    const diffDays = Math.floor(
      (target.getTime() - source.getTime()) / (1000 * 60 * 60 * 24)
    );

    for (const lesson of sourceLessons) {
      const lessonDate = new Date(lesson.datetime);
      const newDate = new Date(lessonDate);
      newDate.setDate(lessonDate.getDate() + diffDays);

      await createLesson({
        variables: {
          input: {
            classId: lesson.class.id,
            classroomId: lesson.classroom.id,
            teacherId: lesson.teacher.id,
            datetime: newDate.toISOString(),
          },
        },
      });
    }
  };

  const rescheduleWeeklyGrid = async () => {
    const sourceWeekStart = getSunday(new Date(sourceDate + "T00:00:00"));
    const targetWeekStart = getSunday(new Date(targetDate + "T00:00:00"));

    const sourceWeekDates = getWeekDates(sourceWeekStart);
    const targetWeekDates = getWeekDates(targetWeekStart);

    const allSourceLessons: Array<{ lesson: ILesson; dayIndex: number }> = [];

    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      const sourceDay = sourceWeekDates[dayIndex];

      const startOfDay = new Date(sourceDay);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(sourceDay);
      endOfDay.setHours(23, 59, 59, 999);

      const { data } = await fetchLessons({
        variables: {
          startDate: startOfDay.toISOString(),
          endDate: endOfDay.toISOString(),
        },
      });

      const dayLessons = data?.listLessons?.results || [];

      dayLessons.forEach((lesson) => {
        allSourceLessons.push({ lesson, dayIndex });
      });
    }

    for (const targetDay of targetWeekDates) {
      const startOfDay = new Date(targetDay);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDay);
      endOfDay.setHours(23, 59, 59, 999);

      const { data: targetData } = await fetchLessons({
        variables: {
          startDate: startOfDay.toISOString(),
          endDate: endOfDay.toISOString(),
        },
      });

      const targetLessons = targetData?.listLessons?.results || [];

      for (const lesson of targetLessons) {
        await destroyLesson({
          variables: { id: lesson.id },
        });
      }
    }

    for (const { lesson, dayIndex } of allSourceLessons) {
      const sourceDay = sourceWeekDates[dayIndex];
      const targetDay = targetWeekDates[dayIndex];

      const diffDays = Math.floor(
        (targetDay.getTime() - sourceDay.getTime()) / (1000 * 60 * 60 * 24)
      );

      const lessonDate = new Date(lesson.datetime);
      const newDate = new Date(lessonDate);
      newDate.setDate(lessonDate.getDate() + diffDays);

      await createLesson({
        variables: {
          input: {
            classId: lesson.class.id,
            classroomId: lesson.classroom.id,
            teacherId: lesson.teacher.id,
            datetime: newDate.toISOString(),
          },
        },
      });
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-lg p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
            {t("schedule.rescheduleGridModal.title")}
          </h3>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === "type" && (
          <div className="space-y-4">
            <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
              {t("schedule.rescheduleGridModal.selectType")}
            </p>

            <button
              onClick={() => handleTypeSelect("daily")}
              className="w-full p-4 border-2 border-slate-200 dark:border-slate-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all text-left"
            >
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-800 dark:text-white mb-1">
                    {t("schedule.rescheduleGridModal.rescheduleDay")}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {t("schedule.rescheduleGridModal.rescheduleDayDescription")}
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleTypeSelect("weekly")}
              className="w-full p-4 border-2 border-slate-200 dark:border-slate-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all text-left"
            >
              <div className="flex items-start gap-3">
                <CalendarDays className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-800 dark:text-white mb-1">
                    {t("schedule.rescheduleGridModal.rescheduleWeek")}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {t(
                      "schedule.rescheduleGridModal.rescheduleWeekDescription"
                    )}
                  </p>
                </div>
              </div>
            </button>
          </div>
        )}

        {step === "dates" && (
          <div className="space-y-4">
            <button
              onClick={() => setStep("type")}
              disabled={isProcessing}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium mb-2 disabled:opacity-50"
            >
              {t("schedule.rescheduleGridModal.back")}
            </button>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                {rescheduleType === "daily"
                  ? t("schedule.rescheduleGridModal.sourceDate")
                  : t("schedule.rescheduleGridModal.sourceWeek")}
              </label>
              <input
                type="date"
                value={sourceDate}
                onChange={(e) => setSourceDate(e.target.value)}
                disabled={isProcessing}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              />
              {rescheduleType === "weekly" && sourceDate && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {t("schedule.rescheduleGridModal.week")}{" "}
                  {getSunday(
                    new Date(sourceDate + "T00:00:00")
                  ).toLocaleDateString(locale)}{" "}
                  {t("schedule.rescheduleGridModal.to")}{" "}
                  {new Date(
                    getSunday(new Date(sourceDate + "T00:00:00")).getTime() +
                      6 * 24 * 60 * 60 * 1000
                  ).toLocaleDateString(locale)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                {rescheduleType === "daily"
                  ? t("schedule.rescheduleGridModal.targetDate")
                  : t("schedule.rescheduleGridModal.targetWeek")}
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                disabled={isProcessing}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              />
              {rescheduleType === "weekly" && targetDate && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {t("schedule.rescheduleGridModal.week")}{" "}
                  {getSunday(
                    new Date(targetDate + "T00:00:00")
                  ).toLocaleDateString(locale)}{" "}
                  {t("schedule.rescheduleGridModal.to")}{" "}
                  {new Date(
                    getSunday(new Date(targetDate + "T00:00:00")).getTime() +
                      6 * 24 * 60 * 60 * 1000
                  ).toLocaleDateString(locale)}
                </p>
              )}
            </div>

            {sourceDate && targetDate && sourceDate === targetDate && (
              <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900 rounded-lg">
                <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-500 mt-0.5 shrink-0" />
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  {t("schedule.rescheduleGridModal.sameDateWarning")}
                </p>
              </div>
            )}

            <div className="flex gap-3 justify-end pt-4">
              <button
                onClick={onClose}
                disabled={isProcessing}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {t("schedule.rescheduleGridModal.cancel")}
              </button>
              <button
                onClick={handleCheckTargetLessons}
                disabled={!sourceDate || !targetDate || isProcessing}
                className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
                {isProcessing
                  ? t("schedule.rescheduleGridModal.checking")
                  : t("schedule.rescheduleGridModal.next")}
              </button>
            </div>
          </div>
        )}

        {step === "confirmation" && (
          <div className="space-y-4">
            <button
              onClick={() => setStep("dates")}
              disabled={isProcessing}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium mb-2 disabled:opacity-50"
            >
              {t("schedule.rescheduleGridModal.back")}
            </button>

            <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-500 mt-0.5 shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold text-red-900 dark:text-red-200 mb-1">
                  {t("schedule.rescheduleGridModal.attention")}
                </h4>
                <p className="text-sm text-red-800 dark:text-red-300">
                  {targetLessonsCount > 0 ? (
                    rescheduleType === "daily" ? (
                      <>
                        <strong>{targetLessonsCount}</strong>{" "}
                        {targetLessonsCount === 1
                          ? t(
                              "schedule.rescheduleGridModal.willBeDeleted"
                            ).replace("classes", "class")
                          : t(
                              "schedule.rescheduleGridModal.willBeDeleted"
                            )}{" "}
                        {new Date(targetDate + "T00:00:00").toLocaleDateString(
                          locale
                        )}
                      </>
                    ) : (
                      <>
                        <strong>{targetLessonsCount}</strong>{" "}
                        {targetLessonsCount === 1
                          ? t(
                              "schedule.rescheduleGridModal.willBeDeleted"
                            ).replace("classes", "class")
                          : t(
                              "schedule.rescheduleGridModal.willBeDeleted"
                            )}{" "}
                        {getSunday(
                          new Date(targetDate + "T00:00:00")
                        ).toLocaleDateString(locale)}{" "}
                        {t("schedule.rescheduleGridModal.to")}{" "}
                        {new Date(
                          getSunday(
                            new Date(targetDate + "T00:00:00")
                          ).getTime() +
                            6 * 24 * 60 * 60 * 1000
                        ).toLocaleDateString(locale)}
                      </>
                    )
                  ) : rescheduleType === "daily" ? (
                    t("schedule.rescheduleGridModal.dailyNoClassesWarning", {
                      date: new Date(
                        targetDate + "T00:00:00"
                      ).toLocaleDateString(locale),
                    })
                  ) : (
                    t("schedule.rescheduleGridModal.weeklyNoClassesWarning", {
                      startDate: getSunday(
                        new Date(targetDate + "T00:00:00")
                      ).toLocaleDateString(locale),
                      endDate: new Date(
                        getSunday(
                          new Date(targetDate + "T00:00:00")
                        ).getTime() +
                          6 * 24 * 60 * 60 * 1000
                      ).toLocaleDateString(locale),
                    })
                  )}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                {t("schedule.rescheduleGridModal.operationSummary")}
              </h4>
              <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                <div className="flex items-start gap-2">
                  <Copy className="w-4 h-4 text-slate-500 dark:text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <strong>{t("schedule.rescheduleGridModal.source")}</strong>{" "}
                    {rescheduleType === "daily" ? (
                      new Date(sourceDate + "T00:00:00").toLocaleDateString(
                        locale
                      )
                    ) : (
                      <>
                        {t("schedule.rescheduleGridModal.week")}{" "}
                        {getSunday(
                          new Date(sourceDate + "T00:00:00")
                        ).toLocaleDateString(locale)}{" "}
                        {t("schedule.rescheduleGridModal.to")}{" "}
                        {new Date(
                          getSunday(
                            new Date(sourceDate + "T00:00:00")
                          ).getTime() +
                            6 * 24 * 60 * 60 * 1000
                        ).toLocaleDateString(locale)}
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400 mt-0.5 shrink-0" />
                  <div>
                    <strong>
                      {t("schedule.rescheduleGridModal.destination")}
                    </strong>{" "}
                    {rescheduleType === "daily" ? (
                      new Date(targetDate + "T00:00:00").toLocaleDateString(
                        locale
                      )
                    ) : (
                      <>
                        {t("schedule.rescheduleGridModal.week")}{" "}
                        {getSunday(
                          new Date(targetDate + "T00:00:00")
                        ).toLocaleDateString(locale)}{" "}
                        {t("schedule.rescheduleGridModal.to")}{" "}
                        {new Date(
                          getSunday(
                            new Date(targetDate + "T00:00:00")
                          ).getTime() +
                            6 * 24 * 60 * 60 * 1000
                        ).toLocaleDateString(locale)}
                      </>
                    )}
                    {targetLessonsCount > 0 && (
                      <span className="text-red-600 dark:text-red-400 font-medium">
                        {" "}
                        ({targetLessonsCount}{" "}
                        {targetLessonsCount === 1 ? "class" : "classes"}{" "}
                        {t("schedule.rescheduleGridModal.willBeDeleted")})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <button
                onClick={onClose}
                disabled={isProcessing}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {t("schedule.rescheduleGridModal.cancel")}
              </button>
              <button
                onClick={handleReschedule}
                disabled={isProcessing}
                className="px-4 py-2 bg-red-600 dark:bg-red-500 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
                {isProcessing
                  ? t("schedule.rescheduleGridModal.rescheduling")
                  : t("schedule.rescheduleGridModal.confirmReschedule")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
