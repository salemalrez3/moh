import api from "../config/api";

export async function getNewsAttachmentsRequest(newsId) {
  const res = await api.get(`/newsAttachments/${newsId}`);
   return res.data.newsAttachments; 
}
