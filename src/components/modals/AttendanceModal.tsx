import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import toast from "react-hot-toast";
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
import { CREATE_FREQUENCY } from "../../graphql/mutations/CreateFrequency";
import { UPDATE_FREQUENCY } from "../../graphql/mutations/UpdateFrequency";
import { UPDATE_LESSON } from "../../graphql/mutations/UpdateLesson";

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

  const handleAttendanceChange = (enrollmentId: string, attendance: boolean) => {
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

      toast.success("Frequências salvas com sucesso!");
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Erro ao salvar frequências:", err);
      toast.error("Erro ao salvar frequências");
    } finally {
      setIsSaving(false);
    }
  };

  const allMarked = enrollments.every(
    (enrollment) => attendanceRecords[enrollment.id]?.attendance !== null &&
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
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-slate-200 p-4 md:p-6 rounded-t-xl bg-white">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-bold text-slate-800">
                  Registro de Presença
                </h2>
                <p className="text-xs md:text-sm text-slate-600">
                  {lesson.class.name} - {lesson.class.level}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isSaving}
              className="text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
            <div className="flex items-center gap-2 text-xs md:text-sm text-slate-600 bg-slate-50 px-2 md:px-3 py-2 rounded-lg border border-slate-200">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="truncate">{lessonDate.toLocaleDateString("pt-BR")}</span>
            </div>
            <div className="flex items-center gap-2 text-xs md:text-sm text-slate-600 bg-slate-50 px-2 md:px-3 py-2 rounded-lg border border-slate-200">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="truncate">{lessonDate.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}</span>
            </div>
            <div className="flex items-center gap-2 text-xs md:text-sm text-slate-600 bg-slate-50 px-2 md:px-3 py-2 rounded-lg border border-slate-200">
              <UsersIcon className="w-4 h-4 text-slate-400" />
              <span className="truncate">{enrollments.length} aluno(s)</span>
            </div>
            <div className="flex items-center gap-2 text-xs md:text-sm text-slate-600 bg-green-50 px-2 md:px-3 py-2 rounded-lg border border-green-200">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="truncate text-green-700 font-medium">{presentCount} presente(s)</span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {enrollments.length === 0 ? (
            <div className="text-center py-12">
              <UsersIcon className="w-12 h-12 md:w-16 md:h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-sm text-slate-500">
                Nenhum aluno matriculado nesta turma
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
                    className="bg-white border border-slate-200 rounded-lg p-3 md:p-4 hover:border-slate-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-slate-800 text-sm md:text-base truncate">
                          {enrollment.student.name}
                        </h4>
                        <p className="text-xs md:text-sm text-slate-600 truncate">
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
                              ? "bg-green-100 text-green-700 border-2 border-green-500"
                              : "bg-white text-slate-600 border-2 border-slate-200 hover:border-green-500 hover:text-green-600"
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" />
                          <span>Presente</span>
                        </button>
                        <button
                          onClick={() =>
                            handleAttendanceChange(enrollment.id, false)
                          }
                          disabled={isSaving}
                          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 md:px-4 py-2 rounded-lg transition-all text-xs md:text-sm font-medium ${
                            isPresent === false
                              ? "bg-red-100 text-red-700 border-2 border-red-500"
                              : "bg-white text-slate-600 border-2 border-slate-200 hover:border-red-500 hover:text-red-600"
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <XCircle className="w-4 h-4 md:w-5 md:h-5" />
                          <span>Ausente</span>
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
        <div className="border-t border-slate-200 p-4 md:p-6 rounded-b-xl bg-white">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-slate-600">
              {absentCount > 0 && (
                <span className="flex items-center gap-1">
                  <XCircle className="w-4 h-4 text-red-600" />
                  {absentCount} ausente(s)
                </span>
              )}
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                onClick={onClose}
                disabled={isSaving}
                className="flex-1 sm:flex-none px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !allMarked}
                className="flex-1 sm:flex-none px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Salvar Frequências
                  </>
                )}
              </button>
            </div>
          </div>
          {!allMarked && enrollments.length > 0 && (
            <p className="text-xs text-amber-600 mt-2 text-center sm:text-right">
              Marque a presença de todos os alunos antes de salvar
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
