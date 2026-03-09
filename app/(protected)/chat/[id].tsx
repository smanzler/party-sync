import { MessageBubble } from "@/components/chat/message-bubble";
import { Text } from "@/components/ui/text";
import { Database } from "@/lib/database-types";
import { supabase } from "@/lib/supabase";
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, FlatList, KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

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
          'postgres_changes',
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'message', 
            filter: `conversation_id=eq.${conversationId}` 
          },
          (payload) => {
            const newMessage = payload.new as Message;
            setMessages((prev) => {
                if (prev.find(m => m.id === newMessage.id)) return prev;
                return [newMessage, ...prev];
            });
          }
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
    <View style={styles.container}>
      {/* 1. Moved the Header OUTSIDE the KeyboardAvoidingView */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat</Text>
        <Text style={{ width: 28 }}>{""}</Text> 
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : undefined} 
        // 2. Reduced offset - usually 0 or the height of the bottom tab bar
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0} 
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
          contentContainerStyle={styles.listContent}
          // 3. This ensures the list doesn't get cut off
          maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
        />
        
        <View style={styles.inputArea}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Message..."
            placeholderTextColor="#666"
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#121212' 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    backgroundColor: '#1A1A1A'
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold'
  },
  backButton: {
    padding: 4,
  },
  listContent: {
    padding: 16
  },
  inputArea: {
    flexDirection: 'row',
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 40 : 12,
    borderTopWidth: 1,
    borderColor: '#222',
    alignItems: 'flex-end',
    gap: 8,
    backgroundColor: '#1A1A1A'
  },
  textInput: {
    flex: 1,
    backgroundColor: '#2C2C2C',
    color: 'white',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 16,
    maxHeight: 120
  },
  sendButton: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2
  }
});