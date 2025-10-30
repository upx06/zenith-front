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
import { CREATE_LESSON } from "../../graphql/mutations/CreateLesson";
import { DESTROY_LESSON } from "../../graphql/mutations/DestroyLesson";
import { LIST_LESSONS } from "../../graphql/queries/ListLessons";
import type { ILesson } from "../../interfaces/ILesson";
import toast from "react-hot-toast";

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
  const [step, setStep] = useState<Step>("type");
  const [rescheduleType, setRescheduleType] = useState<RescheduleType>("daily");
  const [sourceDate, setSourceDate] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [targetLessonsCount, setTargetLessonsCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const [createLesson] = useMutation(CREATE_LESSON);
  const [destroyLesson] = useMutation(DESTROY_LESSON);
  const [fetchLessons] = useLazyQuery<ListLessonsData>(LIST_LESSONS);

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
        // Buscar aulas do dia de destino
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
        // Buscar aulas da semana de destino
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
        toast.success("Grade do dia reagendada com sucesso!");
      } else {
        await rescheduleWeeklyGrid();
        toast.success("Grade da semana reagendada com sucesso!");
      }

      refetchScheduling();
      onClose();
    } catch (error: any) {
      console.error("Erro ao reagendar:", error);
      toast.error(error?.message || "Erro ao reagendar grade");
    } finally {
      setIsProcessing(false);
    }
  };

  const rescheduleDailyGrid = async () => {
    const source = new Date(sourceDate + "T00:00:00");
    const target = new Date(targetDate + "T00:00:00");

    // PASSO 1: Buscar aulas do dia de origem PRIMEIRO (antes de deletar)
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

    // PASSO 2: Deletar todas as aulas do dia de destino
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

    // Deletar todas as aulas de destino
    for (const lesson of targetLessons) {
      await destroyLesson({
        variables: { id: lesson.id },
      });
    }

    // Calcular diferença de dias
    const diffDays = Math.floor(
      (target.getTime() - source.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Duplicar cada aula para a data de destino
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

    // PASSO 1: Buscar todas as aulas da semana de origem PRIMEIRO (antes de deletar)
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

      // Armazenar as aulas com o índice do dia
      dayLessons.forEach((lesson) => {
        allSourceLessons.push({ lesson, dayIndex });
      });
    }

    // PASSO 2: Deletar todas as aulas da semana de destino
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

    // PASSO 3: Duplicar as aulas armazenadas para a semana de destino
    for (const { lesson, dayIndex } of allSourceLessons) {
      const sourceDay = sourceWeekDates[dayIndex];
      const targetDay = targetWeekDates[dayIndex];

      // Calcular diferença de dias
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
        className="bg-white rounded-lg p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">
            Reagendar Grade
          </h3>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === "type" && (
          <div className="space-y-4">
            <p className="text-slate-600 text-sm mb-4">
              Selecione o tipo de reagendamento:
            </p>

            <button
              onClick={() => handleTypeSelect("daily")}
              className="w-full p-4 border-2 border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
            >
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-800 mb-1">
                    Reagendar Dia
                  </h4>
                  <p className="text-sm text-slate-600">
                    Duplicar todas as aulas de um dia específico para outra
                    data
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleTypeSelect("weekly")}
              className="w-full p-4 border-2 border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
            >
              <div className="flex items-start gap-3">
                <CalendarDays className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-800 mb-1">
                    Reagendar Semana
                  </h4>
                  <p className="text-sm text-slate-600">
                    Duplicar todas as aulas de uma semana (domingo a domingo)
                    para outra semana
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
              className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-2 disabled:opacity-50"
            >
              ← Voltar
            </button>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {rescheduleType === "daily"
                  ? "Data de Origem"
                  : "Semana de Origem (qualquer dia da semana)"}
              </label>
              <input
                type="date"
                value={sourceDate}
                onChange={(e) => setSourceDate(e.target.value)}
                disabled={isProcessing}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {rescheduleType === "weekly" && sourceDate && (
                <p className="text-xs text-slate-500 mt-1">
                  Semana: {getSunday(new Date(sourceDate + "T00:00:00")).toLocaleDateString("pt-BR")} a{" "}
                  {new Date(
                    getSunday(new Date(sourceDate + "T00:00:00")).getTime() +
                      6 * 24 * 60 * 60 * 1000
                  ).toLocaleDateString("pt-BR")}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {rescheduleType === "daily"
                  ? "Data de Destino"
                  : "Semana de Destino (qualquer dia da semana)"}
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                disabled={isProcessing}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {rescheduleType === "weekly" && targetDate && (
                <p className="text-xs text-slate-500 mt-1">
                  Semana: {getSunday(new Date(targetDate + "T00:00:00")).toLocaleDateString("pt-BR")} a{" "}
                  {new Date(
                    getSunday(new Date(targetDate + "T00:00:00")).getTime() +
                      6 * 24 * 60 * 60 * 1000
                  ).toLocaleDateString("pt-BR")}
                </p>
              )}
            </div>

            {sourceDate && targetDate && sourceDate === targetDate && (
              <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" />
                <p className="text-sm text-yellow-800">
                  As datas de origem e destino são iguais. As aulas serão
                  duplicadas na mesma data.
                </p>
              </div>
            )}

            <div className="flex gap-3 justify-end pt-4">
              <button
                onClick={onClose}
                disabled={isProcessing}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCheckTargetLessons}
                disabled={!sourceDate || !targetDate || isProcessing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
                {isProcessing ? "Verificando..." : "Próximo"}
              </button>
            </div>
          </div>
        )}

        {step === "confirmation" && (
          <div className="space-y-4">
            <button
              onClick={() => setStep("dates")}
              disabled={isProcessing}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-2 disabled:opacity-50"
            >
              ← Voltar
            </button>

            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold text-red-900 mb-1">
                  Atenção: Esta ação não pode ser desfeita
                </h4>
                <p className="text-sm text-red-800">
                  {targetLessonsCount > 0 ? (
                    <>
                      {rescheduleType === "daily" ? (
                        <>
                          <strong>{targetLessonsCount}</strong>{" "}
                          {targetLessonsCount === 1 ? "aula será excluída" : "aulas serão excluídas"} do dia{" "}
                          {new Date(targetDate + "T00:00:00").toLocaleDateString("pt-BR")} antes de duplicar as aulas do dia de origem.
                        </>
                      ) : (
                        <>
                          <strong>{targetLessonsCount}</strong>{" "}
                          {targetLessonsCount === 1 ? "aula será excluída" : "aulas serão excluídas"} da semana de{" "}
                          {getSunday(new Date(targetDate + "T00:00:00")).toLocaleDateString("pt-BR")} a{" "}
                          {new Date(
                            getSunday(new Date(targetDate + "T00:00:00")).getTime() +
                              6 * 24 * 60 * 60 * 1000
                          ).toLocaleDateString("pt-BR")} antes de duplicar as aulas da semana de origem.
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      {rescheduleType === "daily" ? (
                        <>
                          Não há aulas agendadas para o dia{" "}
                          {new Date(targetDate + "T00:00:00").toLocaleDateString("pt-BR")}. As aulas do dia de origem serão duplicadas.
                        </>
                      ) : (
                        <>
                          Não há aulas agendadas para a semana de{" "}
                          {getSunday(new Date(targetDate + "T00:00:00")).toLocaleDateString("pt-BR")} a{" "}
                          {new Date(
                            getSunday(new Date(targetDate + "T00:00:00")).getTime() +
                              6 * 24 * 60 * 60 * 1000
                          ).toLocaleDateString("pt-BR")}. As aulas da semana de origem serão duplicadas.
                        </>
                      )}
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <h4 className="font-semibold text-slate-900 mb-2">Resumo da operação:</h4>
              <div className="space-y-2 text-sm text-slate-700">
                <div className="flex items-start gap-2">
                  <Copy className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                  <div>
                    <strong>Origem:</strong>{" "}
                    {rescheduleType === "daily" ? (
                      <>{new Date(sourceDate + "T00:00:00").toLocaleDateString("pt-BR")}</>
                    ) : (
                      <>
                        Semana de {getSunday(new Date(sourceDate + "T00:00:00")).toLocaleDateString("pt-BR")} a{" "}
                        {new Date(
                          getSunday(new Date(sourceDate + "T00:00:00")).getTime() +
                            6 * 24 * 60 * 60 * 1000
                        ).toLocaleDateString("pt-BR")}
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Trash2 className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  <div>
                    <strong>Destino:</strong>{" "}
                    {rescheduleType === "daily" ? (
                      <>{new Date(targetDate + "T00:00:00").toLocaleDateString("pt-BR")}</>
                    ) : (
                      <>
                        Semana de {getSunday(new Date(targetDate + "T00:00:00")).toLocaleDateString("pt-BR")} a{" "}
                        {new Date(
                          getSunday(new Date(targetDate + "T00:00:00")).getTime() +
                            6 * 24 * 60 * 60 * 1000
                        ).toLocaleDateString("pt-BR")}
                      </>
                    )}
                    {targetLessonsCount > 0 && (
                      <span className="text-red-600 font-medium"> ({targetLessonsCount} {targetLessonsCount === 1 ? "aula" : "aulas"} serão excluídas)</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <button
                onClick={onClose}
                disabled={isProcessing}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleReschedule}
                disabled={isProcessing}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
                {isProcessing ? "Reagendando..." : "Confirmar Reagendamento"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
