import api from "../config/api";

export async function createSurveyRequest(newSurvey) {
  const res = await api.post("/surveys", newSurvey);
  return res.data;
}


export async function getSurveysRequest({ audience, pageParam = 1 }) {
  const res = await api.get("/surveys", {
    params: { audience, page: pageParam, limit: 10 },
  });
  return res.data;
}

