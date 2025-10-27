export const sendToAwsS3 = async (file: File, controller: string) => {
  const uploadFormData = new FormData();

  uploadFormData.append("file", file);

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/${controller}`,
    {
      method: "POST",
      body: uploadFormData,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.details || "Erro ao fazer upload");
  }

  const data = await response.json();

  return data;
};

export const getPresignedUrlFromAwsS3 = async (
  key: string,
  controller: string
) => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/${controller}?key=${encodeURIComponent(
      key
    )}`,
    {
      method: "GET",
    }
  );

  const data = await response.json();

  return data.url;
};
