import { MessageBubble } from "@/components/chat/message-bubble";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Database } from "@/lib/database-types";
import { supabase } from "@/lib/supabase";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, FlatList, KeyboardAvoidingView, Platform, StyleSheet, TextInput, View } from "react-native";

type Message = Database["public"]["Tables"]["message"]["Row"];

export default function ChatScreen() {
  const { id: conversationId } = useLocalSearchParams<{ id: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [myId, setMyId] = useState<string | null>(null);

  useEffect(() => {
    const setup = async () => {
      const { data } = await supabase.auth.getUser();
      const userId = data.user?.id ?? null;
      setMyId(userId);

      // Fetch history
      const { data: history } = await supabase
        .from("message")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: false });
      
      if (history) setMessages(history);

      // Subscribe to REALTIME
      const channel = supabase
        .channel(`convo_${conversationId}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'message', filter: `conversation_id=eq.${conversationId}` },
          (payload) => {
            setMessages((prev) => [payload.new as Message, ...prev]);
          }
        )
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    };

    setup();
  }, [conversationId]);

  const sendMessage = async () => {
    if (!inputText.trim() || !myId) return;
    const textToSend = inputText.trim();
    setInputText(""); // Optimistic clear

    const { error } = await supabase.from("message").insert({
      conversation_id: conversationId,
      sender_user_id: myId,
      content: textToSend,
    });

    if (error) Alert.alert("Error", "Message failed to send");
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      style={{ flex: 1, backgroundColor: 'white' }}
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
        contentContainerStyle={{ padding: 16 }}
      />
      
      <View style={styles.inputArea}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Message..."
          placeholderTextColor="#999"
          multiline
        />
        <Button size="sm" onPress={sendMessage}>
          <Text>Send</Text>
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  inputArea: {
    flexDirection: 'row',
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 30 : 12,
    borderTopWidth: 1,
    borderColor: '#F2F2F2',
    alignItems: 'flex-end',
    gap: 8
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F3F3F3',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 16,
    maxHeight: 120
  }
});