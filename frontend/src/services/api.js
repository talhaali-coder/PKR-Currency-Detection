import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

export const detectCurrency = async (file, model) => {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("model", model);

  const response = await api.post("/detect", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const detectVideo = async (file, model) => {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("model", model);

  const response = await api.post("/detect-video", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return {
    ...response.data,
    video_url: `${api.defaults.baseURL}${response.data.video_url}`,
  };
};