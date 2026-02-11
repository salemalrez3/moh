import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createAttachmentRequest, getAttachmentsRequest } from "../services/attachments";

export function useCreateAttachment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ surveyId, attachments }) =>
      createAttachmentRequest(surveyId, attachments),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["attachments", variables.surveyId] });
    },
  });
}

export function useGetAttachments(surveyId) {
  return useQuery({
    queryKey: ["attachments", surveyId],
    queryFn: () => getAttachmentsRequest(surveyId),
    enabled: !!surveyId,
  });
}
