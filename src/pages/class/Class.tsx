import {
  GraduationCap,
  Plus,
  Trash2,
  BookOpen,
  Star,
  User,
  Users,
} from "lucide-react";
import type { IClass } from "../../interfaces/IClass";
import { useState } from "react";
import { CreateClassModal } from "../../components/modals/CreateClassModal";
import { UpdateClassModal } from "../../components/modals/UpdateClassModal";
import { Menu } from "../../components/Menu";
import { useMutation, useQuery } from "@apollo/client/react";
import { LIST_CLASSES } from "../../graphql/queries/ListClasses";
import { DESTROY_CLASS } from "../../graphql/mutations/DestroyClass";
import { ConfirmationModal } from "../../components/modals/ConfirmationModal";
import { NavLink } from "react-router";
import type { IListClass } from "../../interfaces/IListClass";

export const Class = () => {
  const [createClassModal, setCreateClassModal] = useState(false);
  const [updateClassModal, setUpdateClassModal] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<IClass | null>(null);

  const { data, loading, error, refetch } = useQuery<IListClass>(LIST_CLASSES);
  const [deleteClass] = useMutation(DESTROY_CLASS);

  const handleDeleteClass = async (id: string) => {
    try {
      await deleteClass({
        variables: {
          id: id,
        },
      });
      await refetch();
    } catch (err) {
      console.error("Erro ao excluir turma:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex">
        <Menu />
        <div className="flex-1 flex items-center justify-center">
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex">
        <Menu />
        <div className="flex-1 flex items-center justify-center">
          <p>Erro ao carregar turmas: {error.message}</p>
        </div>
      </div>
    );
  }

  const turmas = data?.listClass?.results || [];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Menu />
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 p-4 md:p-6 lg:p-8 mt-16 lg:mt-0">
          <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-800 uppercase">
                  Turmas
                </h1>
                <p className="text-slate-600 text-sm md:text-base">
                  Gerencie as turmas da instituição
                </p>
              </div>
              <button
                onClick={() => setCreateClassModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm md:text-base"
              >
                <Plus className="w-4 h-4 md:w-5 md:h-5" />
                Nova Turma
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              {turmas.map((classItem: IClass) => (
                <div
                  key={classItem.id}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6 hover:shadow-md hover:border-slate-300 transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 md:w-6 md:h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800 text-sm md:text-base">
                          {classItem.name}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Star className="w-4 h-4 text-slate-400" />
                      <span className="text-sm">{classItem.level}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <User className="w-4 h-4 text-slate-400" />
                      <span className="text-sm">
                        {classItem.teacher
                          ? classItem.teacher.name
                          : "Nenhum professor"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span className="text-sm">
                        {classItem.student?.length || 0}{" "}
                        {classItem.student?.length === 1 ? "aluno" : "alunos"}
                      </span>
                    </div>
                    {classItem.description && (
                      <div className="flex items-start gap-2 text-slate-600">
                        <BookOpen className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm line-clamp-2">
                          {classItem.description}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setSelectedClass(classItem);
                        setUpdateClassModal(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors text-sm font-medium"
                    >
                      Editar
                    </button>
                    <NavLink
                      to={`/classes/management/${classItem.id}`}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors text-sm font-medium"
                    >
                      <button>Gerenciar</button>
                    </NavLink>
                    <button
                      onClick={() => {
                        setSelectedClass(classItem);
                        setConfirmationModal(true);
                      }}
                      className="flex items-center justify-center px-3 py-2 text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {turmas.length === 0 && (
              <div className="text-center py-12">
                <GraduationCap className="w-12 h-12 md:w-16 md:h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-600 mb-2">
                  Nenhuma turma encontrada
                </h3>
                <button
                  onClick={() => setCreateClassModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors mx-auto text-sm md:text-base"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Turma
                </button>
              </div>
            )}

            {createClassModal && (
              <CreateClassModal
                closeCreateClassModal={() => setCreateClassModal(false)}
                refetchClasses={refetch}
              />
            )}

            {updateClassModal && selectedClass && (
              <UpdateClassModal
                clas={selectedClass}
                closeUpdateClassModal={() => setUpdateClassModal(false)}
                refetchClasses={refetch}
              />
            )}

            {confirmationModal && selectedClass && (
              <ConfirmationModal
                onClose={() => setConfirmationModal(false)}
                onConfirm={() => handleDeleteClass(selectedClass.id)}
                title="Deleção de Turma"
                message={`Tem certeza que deseja excluir a turma ${selectedClass.name}?`}
                confirmText="Confirmar"
                cancelText="Cancelar"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
