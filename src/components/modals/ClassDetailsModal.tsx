import { X } from "lucide-react";
import type { IClass } from "../../interfaces/IClass";
import { ClassCard } from "./ClassCard";

interface ClassDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  classItem: IClass;
  onEdit: (classItem: IClass) => void;
  onManage: (classItem: IClass) => void;
}

export const ClassDetailsModal = ({
  isOpen,
  onClose,
  classItem,
  onEdit,
  onManage,
}: ClassDetailsModalProps) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-8 right-0 text-white hover:text-slate-200 transition-colors z-10"
          title="Fechar"
        >
          <X className="w-6 h-6" />
        </button>

        <ClassCard
          classItem={classItem}
          onEdit={onEdit}
          onManage={onManage}
          showDeleteButton={false}
        />
      </div>
    </div>
  );
};
