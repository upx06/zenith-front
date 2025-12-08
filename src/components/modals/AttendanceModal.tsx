import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import {
  X,
  CheckCircle2,
  XCircle,
  Loader2,
  Save,
  Calendar,
  Clock,
  Users as UsersIcon,
  BookOpen,
} from "lucide-react";

import type { ILesson } from "../../interfaces/ILesson";
import { CREATE_FREQUENCY } from "../../graphql/mutations/create/CreateFrequency";
import { UPDATE_FREQUENCY } from "../../graphql/mutations/update/UpdateFrequency";
import { UPDATE_LESSON } from "../../graphql/mutations/update/UpdateLesson";

interface AttendanceModalProps {
  lesson: ILesson;
  onClose: () => void;
  onSuccess: () => void;
  existingFrequencies?: Array<{
    id: string;
    enrollmentId: string;
    attendance: boolean;
  }>;
}

interface AttendanceRecord {
  enrollmentId: string;
  frequencyId?: string;
  attendance: boolean | null;
}

export const AttendanceModal = ({
  lesson,
  onClose,
  onSuccess,
  existingFrequencies = [],
}: AttendanceModalProps) => {
  const { t } = useTranslation();

  const [attendanceRecords, setAttendanceRecords] = useState<
    Record<string, AttendanceRecord>
  >(() => {
    const initial: Record<string, AttendanceRecord> = {};
    existingFrequencies.forEach((freq) => {
      initial[freq.enrollmentId] = {
        enrollmentId: freq.enrollmentId,
        frequencyId: freq.id,
        attendance: freq.attendance,
      };
    });
    return initial;
  });

  const [isSaving, setIsSaving] = useState(false);

  const [createFrequency] = useMutation(CREATE_FREQUENCY);
  const [updateFrequency] = useMutation(UPDATE_FREQUENCY);
  const [updateLesson] = useMutation(UPDATE_LESSON);

  const enrollments = lesson.class.enrollments || [];
  const lessonDate = new Date(lesson.datetime);

  const handleAttendanceChange = (
    enrollmentId: string,
    attendance: boolean
  ) => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [enrollmentId]: {
        ...prev[enrollmentId],
        enrollmentId,
        attendance,
      },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Salvar todas as frequências
      for (const enrollment of enrollments) {
        const record = attendanceRecords[enrollment.id];

        // Pular se não foi marcado
        if (record?.attendance === null || record?.attendance === undefined) {
          continue;
        }

        if (record.frequencyId) {
          // Atualizar existente
          await updateFrequency({
            variables: {
              id: record.frequencyId,
              input: {
                attendance: record.attendance,
              },
            },
          });
        } else {
          // Criar nova
          await createFrequency({
            variables: {
              input: {
                attendance: record.attendance,
                enrollmentId: enrollment.id,
                lessonId: lesson.id,
              },
            },
          });
        }
      }

      // Marcar a aula como tendo a chamada feita
      await updateLesson({
        variables: {
          id: lesson.id,
          input: {
            attendanceTaken: true,
          },
        },
      });

      toast.success(t("toast.frequency.saveFrequencies"));
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Erro ao salvar frequências:", err);
      toast.error(t("toast.frequency.saveError"));
    } finally {
      setIsSaving(false);
    }
  };

  const allMarked = enrollments.every(
    (enrollment) =>
      attendanceRecords[enrollment.id]?.attendance !== null &&
      attendanceRecords[enrollment.id]?.attendance !== undefined
  );

  const presentCount = enrollments.filter(
    (enrollment) => attendanceRecords[enrollment.id]?.attendance === true
  ).length;

  const absentCount = enrollments.filter(
    (enrollment) => attendanceRecords[enrollment.id]?.attendance === false
  ).length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-700 p-4 md:p-6 rounded-t-xl bg-white dark:bg-slate-900">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white">
                  {t("frequency.presenceRegister")}
                </h2>
                <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300">
                  {lesson.class.name} - {lesson.class.level}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isSaving}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
            <div className="flex items-center gap-2 text-xs md:text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-2 md:px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
              <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              <span className="truncate">
                {lessonDate.toLocaleDateString("pt-BR")}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs md:text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-2 md:px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
              <Clock className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              <span className="truncate">
                {lessonDate.toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs md:text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-2 md:px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
              <UsersIcon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              <span className="truncate">
                {enrollments.length} {t("common.common.student")}(s)
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs md:text-sm text-slate-600 dark:text-slate-300 bg-green-50 dark:bg-green-950/30 px-2 md:px-3 py-2 rounded-lg border border-green-200 dark:border-green-900">
              <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="truncate text-green-700 dark:text-green-400 font-medium">
                {presentCount} {t("common.common.presence")}(s)
              </span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {enrollments.length === 0 ? (
            <div className="text-center py-12">
              <UsersIcon className="w-12 h-12 md:w-16 md:h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t("common.random.classNoStudentEnrolled")}
              </p>
            </div>
          ) : (
            <div className="space-y-2 md:space-y-3">
              {enrollments.map((enrollment: any) => {
                const record = attendanceRecords[enrollment.id];
                const isPresent = record?.attendance;

                return (
                  <div
                    key={enrollment.id}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 md:p-4 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-slate-800 dark:text-white text-sm md:text-base truncate">
                          {enrollment.student.name}
                        </h4>
                        <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 truncate">
                          {enrollment.student.email}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            handleAttendanceChange(enrollment.id, true)
                          }
                          disabled={isSaving}
                          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 md:px-4 py-2 rounded-lg transition-all text-xs md:text-sm font-medium ${
                            isPresent === true
                              ? "bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400 border-2 border-green-500 dark:border-green-600"
                              : "bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-2 border-slate-200 dark:border-slate-600 hover:border-green-500 dark:hover:border-green-600 hover:text-green-600 dark:hover:text-green-400"
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" />
                          <span>{t("common.common.presence")}</span>
                        </button>
                        <button
                          onClick={() =>
                            handleAttendanceChange(enrollment.id, false)
                          }
                          disabled={isSaving}
                          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 md:px-4 py-2 rounded-lg transition-all text-xs md:text-sm font-medium ${
                            isPresent === false
                              ? "bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 border-2 border-red-500 dark:border-red-600"
                              : "bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-2 border-slate-200 dark:border-slate-600 hover:border-red-500 dark:hover:border-red-600 hover:text-red-600 dark:hover:text-red-400"
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <XCircle className="w-4 h-4 md:w-5 md:h-5" />
                          <span>{t("common.common.absence")}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 dark:border-slate-700 p-4 md:p-6 rounded-b-xl bg-white dark:bg-slate-900">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-slate-600 dark:text-slate-300">
              {absentCount > 0 && (
                <span className="flex items-center gap-1">
                  <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                  {absentCount} {t("common.common.absence")}(s)
                </span>
              )}
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                onClick={onClose}
                disabled={isSaving}
                className="flex-1 sm:flex-none px-6 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t("common.actions.cancel")}
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !allMarked}
                className="flex-1 sm:flex-none px-6 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t("common.status.saving")}
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {t("frequency.saveFrequencies")}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
