import api from "../config/api";

// API functions
export async function createAttachmentRequest(surveyId, attachments) {
  const formData = new FormData();
  attachments.forEach((f) => formData.append("attachments", f));

  const res = await api.post(`/attachments/${surveyId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function getAttachmentsRequest(surveyId) {
  const res = await api.get(`/attachments/${surveyId}`);
  return res.data;
}
