import { useQuery } from "@tanstack/react-query"
import { getNewsAttachmentsRequest } from "../services/newsAttachments"


export function useGetNewsAttachments(newsId){
    return useQuery({
          queryKey: ["newsAttachments", newsId],
            queryFn: () => getNewsAttachmentsRequest(newsId),
            enabled: !!newsId,
    })
}