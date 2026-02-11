import api from "../config/api";

export async function getNewsRequest({ pageParam = undefined, limit = 10 }) {
  const params = { limit };
  if (pageParam !== undefined && pageParam !== null) params.cursor = pageParam;

  const res = await api.get("/news", { params });
  return res.data;
}
export const createNewsRequest = async (payload) => {
  const { data } = await api.post("/news", payload,{   headers: {
      "Content-Type": "multipart/form-data",
    },});
  return data;
};