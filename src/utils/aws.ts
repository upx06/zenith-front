export const sendToAws = async (file: File, controller: string) => {
  const uploadFormData = new FormData();

  uploadFormData.append("file", file);

  const response = await fetch(`http://localhost:4000/${controller}`, {
    method: "POST",
    body: uploadFormData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.details || "Erro ao fazer upload");
  }

  const data = await response.json();

  return data;
};
