import { MessageBubble } from "@/components/chat/message-bubble";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { Database } from "@/lib/database-types";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Send } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Message = Database["public"]["Tables"]["message"]["Row"];

export default function ChatScreen() {
  const { id: conversationId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [myId, setMyId] = useState<string | null>(null);

  useEffect(() => {
    let channel: any;

    const setup = async () => {
      const { data } = await supabase.auth.getUser();
      const userId = data.user?.id ?? null;
      setMyId(userId);

      const { data: history } = await supabase
        .from("message")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: false });

      if (history) setMessages(history);

      channel = supabase
        .channel(`convo_${conversationId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "message",
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload) => {
            const newMessage = payload.new as Message;
            setMessages((prev) => {
              if (prev.find((m) => m.id === newMessage.id)) return prev;
              return [newMessage, ...prev];
            });
          },
        )
        .subscribe();
    };

    setup();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [conversationId]);

  const sendMessage = async () => {
    if (!inputText.trim() || !myId) return;
    const textToSend = inputText.trim();
    setInputText("");

    const { error } = await supabase.from("message").insert({
      conversation_id: conversationId,
      sender_user_id: myId,
      content: textToSend,
    });

    if (error) {
      Alert.alert("Error", "Message failed to send");
      setInputText(textToSend);
    }
  };

  return (
    <View className="flex-1">
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "Chat",
          headerBackButtonDisplayMode: "minimal",
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
        style={{ flex: 1 }}
      >
        <FlatList
          data={messages}
          inverted
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <MessageBubble
              content={item.content ?? ""}
              isMe={item.sender_user_id === myId}
              timestamp={item.created_at}
            />
          )}
          contentContainerClassName="p-4"
          // 3. This ensures the list doesn't get cut off
          maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
        />

        <View className="p-4 pb-10 flex-row gap-2">
          <TextInput
            className="flex-1 bg-neutral-200 rounded-3xl min-h-10 px-3 py-3"
            value={inputText}
            onChangeText={setInputText}
            placeholder="Message..."
            placeholderTextColor="#666"
            multiline
          />
          <TouchableOpacity
            className="bg-blue-500 rounded-full items-center justify-center size-10"
            onPress={sendMessage}
          >
            <Icon as={Send} className="text-secondary" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
