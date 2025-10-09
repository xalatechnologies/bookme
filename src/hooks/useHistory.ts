import { useQuery } from "@tanstack/react-query";
import { historyService } from "@/services/history.service";
import type { IHistoryQuery } from "@/types/history";

export function useHistory(q: IHistoryQuery) {
  return useQuery({
    queryKey: ["history", q],
    queryFn: () => historyService.list(q),
    placeholderData: (previousData) => previousData,
  });
}
