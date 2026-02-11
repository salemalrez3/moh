import api from "../config/api";

export async function getResponsesRequest({ surveyId, pageParam = 1 }) {
  const res = await api.get(`/responses/${surveyId}`, {
    params: {  page: pageParam, limit: 20 },
  });
  return res.data;
}

export async function createResponseRequest(surveyId, newResponse) {
  const res = await api.post(`/responses/${surveyId}`, newResponse);
  return res.data;
}
