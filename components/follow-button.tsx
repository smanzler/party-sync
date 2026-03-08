import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";
import {
  useDeleteFollow,
  useInsertFollow,
} from "@/tanstack/profiles/mutations";
import { useFollow } from "@/tanstack/profiles/queries";
import { UserCheck2, UserPlus2 } from "lucide-react-native";
import React from "react";
import { Button } from "./ui/button";
import { Icon } from "./ui/icon";
import { Spinner } from "./ui/spinner";

type FollowButtonProps = {
  userId: string;
  className?: string;
  children?: (props: {
    onPress: () => void;
    pending: boolean;
    following: boolean;
  }) => React.ReactElement;
};

export default function FollowButton({
  userId,
  className,
  children,
}: FollowButtonProps) {
  const { user } = useAuth();

  const { data: follow } = useFollow(user?.id, userId);
  const { mutate: followUser, isPending: followPending } = useInsertFollow();
  const { mutate: unfollowUser, isPending: unfollowPending } =
    useDeleteFollow();

  const pending = followPending || unfollowPending;
  const following = !!follow;

  const handleAddUser = () => {
    if (!user) return;

    if (!follow) {
      followUser({ userId: user.id, targetUserId: userId });
    } else {
      unfollowUser({ userId: user.id, targetUserId: userId });
    }
  };

  const props = { onPress: handleAddUser, pending, following };

  if (children !== undefined) return children(props);

  return (
    <Button
      size="icon"
      variant={following ? "outline" : "default"}
      disabled={pending}
      className={cn("rounded-full", className)}
      onPress={handleAddUser}
    >
      {pending ? (
        <Spinner className={cn(!following && "text-primary-foreground")} />
      ) : following ? (
        <Icon as={UserCheck2} />
      ) : (
        <Icon as={UserPlus2} className="text-primary-foreground" />
      )}
    </Button>
  );
}
