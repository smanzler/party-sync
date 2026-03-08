import { useQuery } from "@tanstack/react-query";
import { getFollow } from "./client";

export const useFollow = (userId?: string, targetUserId?: string) =>
  useQuery({
    queryKey: ["follow", userId, targetUserId],
    queryFn: () => getFollow(userId!, targetUserId!),
    enabled: !!userId && !!targetUserId,
  });
