import { useQuery } from "@tanstack/react-query";
import { getFollow, getProfile } from "./client";

export const useFollow = (userId?: string, targetUserId?: string) =>
  useQuery({
    queryKey: ["follow", userId, targetUserId],
    queryFn: () => getFollow(userId!, targetUserId!),
    enabled: !!userId && !!targetUserId,
  });

export const useProfile = (userId?: string) =>
  useQuery({
    queryKey: ["profile", userId],
    queryFn: () => getProfile(userId!),
    enabled: !!userId,
  });
