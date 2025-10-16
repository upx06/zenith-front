import { GraduationCap, Plus } from "lucide-react";
import type { IClass } from "../../interfaces/IClass";
import { useState } from "react";
import { CreateClassModal } from "../../components/modals/CreateClassModal";
import { UpdateClassModal } from "../../components/modals/UpdateClassModal";
import { Menu } from "../../components/Menu";
import { useMutation, useQuery } from "@apollo/client/react";
import { LIST_CLASSES } from "../../graphql/queries/ListClasses";
import { DESTROY_CLASS } from "../../graphql/mutations/DestroyClass";
import { ConfirmationModal } from "../../components/modals/ConfirmationModal";
import { ManageClassModal } from "../../components/modals/ManageClassModal";
import type { IListClasses } from "../../interfaces/IListClasses";
import { ClassCard } from "../../components/modals/ClassCard";

export const Class = () => {
  const [createClassModal, setCreateClassModal] = useState(false);
  const [updateClassModal, setUpdateClassModal] = useState(false);
  const [manageClassModal, setManageClassModal] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<IClass | null>(null);

  const { data, loading, error, refetch } =
    useQuery<IListClasses>(LIST_CLASSES);
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

  const turmas = data?.listClasses?.results || [];

  // console.log(turmas);

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
                <ClassCard
                  key={classItem.id}
                  classItem={classItem}
                  onEdit={(c) => {
                    setSelectedClass(c);
                    setUpdateClassModal(true);
                  }}
                  onManage={(c) => {
                    setSelectedClass(c);
                    setManageClassModal(true);
                  }}
                  onDelete={(c) => {
                    setSelectedClass(c);
                    setConfirmationModal(true);
                  }}
                  showDeleteButton={true}
                />
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

            {manageClassModal && selectedClass && (
              <ManageClassModal
                clas={selectedClass}
                closeManageClassModal={() => setManageClassModal(false)}
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
