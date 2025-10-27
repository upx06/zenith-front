import { GraduationCap, Star, Users, Languages, Trash2 } from "lucide-react";
import type { IClass } from "../../interfaces/IClass";

interface ClassCardProps {
  classItem: IClass;
  onEdit: (classItem: IClass) => void;
  onManage: (classItem: IClass) => void;
  onDelete?: (classItem: IClass) => void;
  showDeleteButton?: boolean;
}

export const ClassCard = ({
  classItem,
  onEdit,
  onManage,
  onDelete,
  showDeleteButton = true,
}: ClassCardProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6 hover:shadow-md hover:border-slate-300 transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-slate-800 text-sm md:text-base truncate">
              {classItem.name}
            </h3>
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-slate-600">
          <Star className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <span className="text-sm">{classItem.level}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <Languages className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <span className="text-sm truncate">{classItem?.language?.name}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <Users className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <span className="text-sm">
            {classItem.enrollments?.length || 0}{" "}
            {classItem.enrollments?.length === 1 ? "aluno" : "alunos"}
          </span>
        </div>
      </div>

      <div
        className={`flex gap-2 pt-2 border-t border-slate-100 ${
          showDeleteButton ? "" : "justify-center"
        }`}
      >
        <button
          onClick={() => onEdit(classItem)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors text-sm font-medium"
        >
          Editar
        </button>

        <button
          onClick={() => onManage(classItem)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors text-sm font-medium"
        >
          Gerenciar
        </button>

        {showDeleteButton && onDelete && (
          <button
            onClick={() => onDelete(classItem)}
            className="flex items-center justify-center px-3 py-2 text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors"
            title="Excluir"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
