import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  Loader2,
  Mail,
  Phone,
  Plus,
  Trash2,
  Users,
  AlertCircle,
  Pencil,
} from "lucide-react";

import { CreateTeacherModal } from "../../components/modals/create/CreateTeacherModal";
import { UpdateTeacherModal } from "../../components/modals/update/UpdateTeacherModal";
import { Menu } from "../../components/Menu";
import { PhoneDisplay } from "../../components/PhoneDisplay";
import { ConfirmationModal } from "../../components/modals/ConfirmationModal";

import { LIST_TEACHERS } from "../../graphql/queries/ListTeachers";
import { DESTROY_TEACHER } from "../../graphql/mutations/DestroyTeacher";

import type { ITeacher } from "../../interfaces/ITeacher";
import type { IListTeachers } from "../../interfaces/IListTeachers";
import { TeacherDetailsModal } from "../../components/modals/TeacherDetailsModal";
import { getPresignedUrlFromAwsS3 } from "../../utils/aws";

export const Teacher = () => {
  const [createTeacherModal, setCreateTeacherModal] = useState(false);
  const [updateTeacherModal, setUpdateTeacherModal] = useState(false);
  const [detailTeacherModal, setDetailTeacherModal] = useState(false);

  const [confirmationModal, setConfirmationModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<ITeacher | null>(null);
  const [selectedTeacherPhoto, setSelectedTeacherPhoto] = useState<
    string | null
  >(null);
  const [deletingTeacherId, setDeletingTeacherId] = useState<string | null>(
    null
  );
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});
  const [photosLoading, setPhotosLoading] = useState(true);

  const { data, loading, error, refetch } =
    useQuery<IListTeachers>(LIST_TEACHERS);
  const [
    deleteTeacher,
    { loading: loadingDeleteTeacher, error: errorDeleteTeacher },
  ] = useMutation(DESTROY_TEACHER);

  const handleDeleteTeacher = async (id: string) => {
    setDeletingTeacherId(id);
    try {
      await deleteTeacher({
        variables: { id },
      });
      await refetch();
      setConfirmationModal(false);
      setSelectedTeacher(null);
    } catch (err) {
      console.error("Erro ao excluir professor:", err);
    } finally {
      setDeletingTeacherId(null);
    }
  };

  const handleOpenConfirmationModal = (teacher: ITeacher) => {
    setSelectedTeacher(teacher);
    setConfirmationModal(true);
  };

  const handleOpenUpdateModal = (teacher: ITeacher, photoUrl: string) => {
    setSelectedTeacher(teacher);
    setSelectedTeacherPhoto(photoUrl);
    setUpdateTeacherModal(true);
  };

  const handleOpenDetailsModal = (teacher: ITeacher, photoUrl: string) => {
    setSelectedTeacher(teacher);
    setSelectedTeacherPhoto(photoUrl);
    setDetailTeacherModal(true);
  };

  // Estados auxiliares
  const isProcessing = loadingDeleteTeacher;
  const professores = data?.listTeachers?.results || [];

  useEffect(() => {
    const loadPhotos = async () => {
      setPhotosLoading(true); // ← Inicia loading
      const urls: Record<string, string> = {};

      for (const teacher of professores) {
        if (teacher.photoKey) {
          try {
            const url = await getPresignedUrlFromAwsS3(
              teacher.photoKey,
              "profile-photo"
            );
            urls[teacher.id] = url;
          } catch (error) {
            console.error(
              `Erro ao carregar foto do professor ${teacher.id}:`,
              error
            );
          }
        }
      }

      setPhotoUrls(urls);
      setPhotosLoading(false); // ← Finaliza loading
    };

    if (professores.length > 0) {
      loadPhotos();
    } else {
      setPhotosLoading(false); // ← Se não há professores, também finaliza
    }
  }, [professores]);

  // Loading principal (dados + fotos)
  if (loading || photosLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex">
        <Menu />
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-slate-600 font-medium">
              {loading ? "Carregando professores..." : "Carregando fotos..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex">
        <Menu />
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="text-center max-w-md">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-600 mb-2">
              Erro ao carregar professores
            </h2>
            <p className="text-slate-600 mb-6">{error.message}</p>
            <button
              onClick={() => refetch()}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Menu />
      <div
        className="hidden lg:block lg:w-64 xl:w-72 flex-shrink-0"
        aria-hidden="true"
      />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Overlay de loading durante deleção */}
        {isProcessing && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-slate-600 font-medium">
                Excluindo professor...
              </p>
            </div>
          </div>
        )}

        <div className="flex-1 p-4 md:p-6 lg:p-8 mt-16 lg:mt-0">
          {/* Mensagem de erro da mutation de deleção */}
          {errorDeleteTeacher && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800 mb-2">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium">Erro ao excluir professor:</span>
              </div>
              <p className="text-red-700 text-sm mb-3">
                {errorDeleteTeacher.message}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
              >
                Recarregar página
              </button>
            </div>
          )}

          <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-800 uppercase">
                  Professores
                </h1>
                <p className="text-slate-600 text-sm md:text-base">
                  Gerencie os professores da instituição
                </p>
              </div>
              <button
                onClick={() => setCreateTeacherModal(true)}
                disabled={isProcessing}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm md:text-base"
              >
                <Plus className="w-4 h-4 md:w-5 md:h-5" />
                Novo Professor
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              {professores.map((teacher: ITeacher) => {
                const photoUrl = photoUrls[teacher.id];
                return (
                  <div
                    key={teacher.id}
                    className={`bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6 hover:shadow-md hover:border-slate-300 transition-all duration-200 ${
                      deletingTeacherId === teacher.id ? "opacity-50" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {photoUrl ? (
                          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border border-slate-200 flex-shrink-0">
                            <img
                              src={photoUrl}
                              alt={`Foto de ${teacher.name}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <Users className="w-5 h-5 md:w-6 md:h-6 text-white" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-slate-800 text-sm md:text-base">
                            {teacher.name}
                          </h3>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <span className="text-sm truncate">
                          {teacher.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <PhoneDisplay
                          phone={teacher.phone}
                          className="text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() =>
                          handleOpenDetailsModal(teacher, photoUrl)
                        }
                        disabled={isProcessing}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                      >
                        Ver detalhes
                      </button>
                      <button
                        onClick={() => handleOpenUpdateModal(teacher, photoUrl)}
                        disabled={isProcessing}
                        className="flex items-center justify-center px-3 py-2 text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenConfirmationModal(teacher)}
                        disabled={isProcessing}
                        className="flex items-center justify-center px-3 py-2 text-red-600 hover:bg-red-50 border border-red-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Excluir"
                      >
                        {deletingTeacherId === teacher.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {professores.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 md:w-16 md:h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-600 mb-2">
                  Nenhum professor encontrado
                </h3>
                <button
                  onClick={() => setCreateTeacherModal(true)}
                  disabled={isProcessing}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors mx-auto text-sm md:text-base"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Professor
                </button>
              </div>
            )}

            {createTeacherModal && (
              <CreateTeacherModal
                closeCreateTeacherModal={() => setCreateTeacherModal(false)}
                refetchTeachers={refetch}
              />
            )}

            {updateTeacherModal && selectedTeacher && (
              <UpdateTeacherModal
                teacher={selectedTeacher}
                photo={selectedTeacherPhoto}
                closeUpdateTeacherModal={() => setUpdateTeacherModal(false)}
                refetchTeachers={refetch}
              />
            )}

            {detailTeacherModal && selectedTeacher && (
              <TeacherDetailsModal
                teacher={selectedTeacher}
                photo={selectedTeacherPhoto}
                closeTeacherDetailsModal={() => setDetailTeacherModal(false)}
              />
            )}

            {confirmationModal && selectedTeacher && (
              <ConfirmationModal
                onClose={() => {
                  if (!isProcessing) {
                    setConfirmationModal(false);
                    setSelectedTeacher(null);
                  }
                }}
                onConfirm={() => handleDeleteTeacher(selectedTeacher.id)}
                title="Deleção de Professor"
                message={`Tem certeza que deseja excluir o(a) professor(a) ${selectedTeacher.name}?`}
                confirmText={
                  loadingDeleteTeacher ? "Excluindo..." : "Confirmar"
                }
                cancelText="Cancelar"
                isLoading={loadingDeleteTeacher}
                isDisabled={isProcessing}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
