import { queryClient } from "@/lib/query";
import { useMutation } from "@tanstack/react-query";
import { deleteFollow, insertFollow } from "./client";

export const useInsertFollow = () =>
  useMutation({
    mutationFn: ({
      userId,
      targetUserId,
    }: {
      userId: string;
      targetUserId: string;
    }) => insertFollow(userId, targetUserId),
    onSuccess: (data) => {
      queryClient.setQueryData(
        ["follow", data.user_id, data.target_user_id],
        () => data,
      );
    },
  });

export const useDeleteFollow = () =>
  useMutation({
    mutationFn: ({
      userId,
      targetUserId,
    }: {
      userId: string;
      targetUserId: string;
    }) => deleteFollow(userId, targetUserId),
    onSuccess: (data) => {
      queryClient.removeQueries({
        queryKey: ["follow", data.user_id, data.target_user_id],
      });
    },
  });
