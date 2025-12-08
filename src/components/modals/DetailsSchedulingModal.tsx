import { useState } from "react";
import {
  X,
  Calendar,
  User,
  Users,
  Trash2,
  Edit,
  MapPin,
  Mail,
  Phone,
} from "lucide-react";
import { ConfirmationModal } from "./ConfirmationModal";
import { ClassroomLayout } from "../ClassroomLayout";
import type { IClass } from "../../interfaces/IClass";
import { formatDateTimeForDisplay } from "../../utils/date";
import { format, parseISO } from "date-fns";
import { ptBR, enUS } from "date-fns/locale";
import { useMutation } from "@apollo/client/react";
import { DESTROY_LESSON } from "../../graphql/mutations/destroy/DestroyLesson";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

interface DetailsSchedulingModalProps {
  onClose: () => void;
  onEdit?: () => void;
  scheduling: {
    id: string;
    subject: string;
    teacher: string;
    class: string;
    datetime: string;
  };
  classData?: IClass;
  teacherData?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  classroomData?: {
    id: string;
    name: string;
    capacity: number;
  };
  roomName: string;
  timeSlot: string;
  date: string;
  isLoading?: boolean;
  refetchScheduling: () => void;
}

export const DetailsSchedulingModal = ({
  onClose,
  onEdit,
  scheduling,
  classData,
  teacherData,
  classroomData,
  roomName,
  timeSlot,
  date,
  isLoading = false,
  refetchScheduling,
}: DetailsSchedulingModalProps) => {
  const { t, i18n } = useTranslation();
  const [showConfirmation, setShowConfirmation] = useState(false);

  const [
    deleteLesson,
    { loading: loadingDeleteLesson, error: errorDeleteLesson },
  ] = useMutation(DESTROY_LESSON);

  const handleDeleteClick = () => {
    setShowConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteLesson({
        variables: {
          id: scheduling.id,
        },
      });

      toast.success(t("schedule.detailSchedulingModal.toast.deleteSuccess"));
      refetchScheduling();
      setShowConfirmation(false);
      onClose();
    } catch (error: any) {
      console.error("Erro ao excluir agendamento:", error);
      toast.error(
        error?.message || t("schedule.detailSchedulingModal.toast.deleteError")
      );
    }
  };

  const handleCloseConfirmation = () => {
    if (!loadingDeleteLesson) {
      setShowConfirmation(false);
    }
  };

  const isProcessing = isLoading || loadingDeleteLesson;

  const parsedDate = parseISO(scheduling.datetime);
  const locale = i18n.language === "pt-BR" ? ptBR : enUS;
  const dayOfWeek = format(parsedDate, "EEEE", { locale });
  const formattedDate = format(parsedDate, "dd/MM/yyyy", { locale });

  const students = classData?.enrollments?.map((e) => e.student) || [];
  const teacher = teacherData || {
    id: "unknown",
    name: scheduling.teacher,
  };
  const capacity = classroomData?.capacity || 20;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <div
          className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 px-6 py-4 rounded-t-xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">
                  {scheduling.subject}
                </h2>
                <p className="text-blue-100 text-sm">
                  {date} • {timeSlot} •{" "}
                  {t("schedule.detailSchedulingModal.room")} {roomName}
                </p>
              </div>
              <button
                onClick={onClose}
                disabled={isProcessing}
                className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-5 max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase">
                      {t("schedule.detailSchedulingModal.location")}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-lg font-bold text-slate-900 dark:text-white">
                      {roomName}
                    </div>
                    {classroomData && (
                      <div className="text-sm text-slate-600 dark:text-slate-300">
                        {t("schedule.detailSchedulingModal.capacity")}:{" "}
                        {classroomData.capacity}{" "}
                        {t("schedule.detailSchedulingModal.places")}
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase">
                      {t("schedule.detailSchedulingModal.dateAndTime")}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                      {dayOfWeek}
                    </div>
                    <div className="text-base font-bold text-slate-900 dark:text-white">
                      {formattedDate} - {timeSlot}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase">
                      {t("schedule.detailSchedulingModal.teacher")}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      {scheduling.teacher}
                    </div>
                    {teacherData?.email && (
                      <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1 truncate">
                        <Mail className="h-3 w-3 shrink-0" />
                        <span className="truncate">{teacherData.email}</span>
                      </div>
                    )}
                    {teacherData?.phone && (
                      <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1">
                        <Phone className="h-3 w-3 shrink-0" />
                        {teacherData.phone}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    {t("schedule.detailSchedulingModal.classInfo")}
                  </h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="text-center">
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                      {t("schedule.detailSchedulingModal.class")}
                    </div>
                    <div className="text-base font-bold text-slate-900 dark:text-white">
                      {scheduling.class}
                    </div>
                  </div>
                  {classData && (
                    <>
                      <div className="text-center">
                        <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                          {t("schedule.detailSchedulingModal.language")}
                        </div>
                        <div className="text-base font-bold text-slate-900 dark:text-white">
                          {classData.language?.name}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                          {t("schedule.detailSchedulingModal.level")}
                        </div>
                        <div className="text-base font-bold text-slate-900 dark:text-white">
                          {classData.level}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                          {t("schedule.detailSchedulingModal.students")}
                        </div>
                        <div className="text-base font-bold text-slate-900 dark:text-white">
                          {students.length}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
                  {t("schedule.detailSchedulingModal.classroomView")}
                </h3>
                <ClassroomLayout
                  teacher={teacher}
                  students={students}
                  capacity={capacity}
                />
              </div>

              {/* Mensagem de erro da exclusão */}
              {errorDeleteLesson && (
                <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg">
                  <div className="flex items-center gap-2 text-red-800 dark:text-red-400 mb-1">
                    <span className="font-medium text-sm">
                      {t(
                        "schedule.detailSchedulingModal.errorDeletingScheduling"
                      )}
                    </span>
                  </div>
                  <p className="text-red-700 dark:text-red-300 text-sm">
                    {errorDeleteLesson.message}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer - Botões de Ação */}
          <div className="border-t border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800">
            <div className="flex flex-col sm:flex-row gap-3 justify-between">
              <div className="flex gap-2">
                {onEdit && (
                  <button
                    onClick={onEdit}
                    disabled={isProcessing}
                    className="px-4 py-2 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Edit className="h-4 w-4" />
                    <span>{t("schedule.detailSchedulingModal.edit")}</span>
                  </button>
                )}
                <button
                  onClick={onClose}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t("schedule.detailSchedulingModal.close")}
                </button>
              </div>
              <button
                onClick={handleDeleteClick}
                disabled={isProcessing}
                className="px-4 py-2 bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingDeleteLesson ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{t("schedule.detailSchedulingModal.deleting")}</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    <span>{t("schedule.detailSchedulingModal.delete")}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Confirmação */}
      {showConfirmation && (
        <ConfirmationModal
          onClose={handleCloseConfirmation}
          onConfirm={handleConfirmDelete}
          title={t("schedule.detailSchedulingModal.confirmDelete.title")}
          message={t("schedule.detailSchedulingModal.confirmDelete.message", {
            className: scheduling.class,
            dateTime: formatDateTimeForDisplay(scheduling.datetime),
            teacherName: scheduling.teacher,
          })}
          confirmText={
            loadingDeleteLesson
              ? t("schedule.detailSchedulingModal.deleting")
              : t("schedule.detailSchedulingModal.confirmDelete.confirm")
          }
          cancelText={t("schedule.detailSchedulingModal.confirmDelete.cancel")}
          isLoading={loadingDeleteLesson}
          isDisabled={loadingDeleteLesson}
        />
      )}
    </>
  );
};
