import FollowButton from "@/components/follow-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { useProfile } from "@/tanstack/profiles/queries";
import { Stack, useLocalSearchParams } from "expo-router";
import { ArrowLeft, User } from "lucide-react-native";
import { ScrollView, View } from "react-native";

export default function Profile() {
  const { id } = useLocalSearchParams();

  const { data: profile, isLoading } = useProfile(id as string | undefined);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Stack.Screen
          options={{
            headerShown: true,
            headerTitle: "Loading",
            headerBackTitle: "Back",
          }}
        />
        <Spinner />
      </View>
    );
  }

  if (!profile) {
    return (
      <Empty>
        <Stack.Screen
          options={{
            headerShown: true,
            headerTitle: "No User",
            headerBackTitle: "Back",
          }}
        />
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Icon as={User} />
          </EmptyMedia>
          <EmptyTitle>User not found</EmptyTitle>
          <EmptyDescription>
            We couldn't find the user you are looking for.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button>
            <Icon as={ArrowLeft} />
            <Text>Go Back</Text>
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <ScrollView className="p-6">
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: profile.username ?? "",
          headerBackTitle: "Back",
        }}
      />
      <Card className="relative mt-13 border-0 shadow-none">
        <CardContent className="pt-9">
          <View className="absolute bg-card -top-6 left-4 -translate-y-1/2 p-2 z-1 rounded-full">
            <Avatar alt={profile.username ?? ""} className="size-24">
              <AvatarImage source={{ uri: profile.avatar_url ?? "" }} />
              <AvatarFallback>
                <Text>SM</Text>
              </AvatarFallback>
            </Avatar>
          </View>
          <Text className="font-bold text-xl">{profile.username}</Text>
          {profile.bio && (
            <Text className="text-muted-foreground">{profile.bio}</Text>
          )}
          <FollowButton
            className="absolute right-4 -top-2"
            userId={profile.id}
          />
        </CardContent>
      </Card>
    </ScrollView>
  );
}
