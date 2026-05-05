import { apiPost } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";


export function useCompareExecutions(){

    return useMutation({
        mutationFn: (executionIds: string[])=> apiPost<any>('/ingest/executions/compare', {
            executionIds
        })
    })
}