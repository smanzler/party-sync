// components/chat/message-bubble.tsx
import { Text } from '@/components/ui/text';
import { StyleSheet, View } from 'react-native';

interface MessageBubbleProps {
  content: string;
  isMe: boolean;
  timestamp: string;
}

export function MessageBubble({ content, isMe, timestamp }: MessageBubbleProps) {
  return (
    <View style={[styles.container, isMe ? styles.myContainer : styles.theirContainer]}>
      <View style={[
        styles.bubble,
        isMe ? styles.myBubble : styles.theirBubble
      ]}>
        <Text style={{ color: isMe ? 'white' : 'black' }}>{content}</Text>
      </View>
      <Text style={styles.timestamp}>
        {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 12, maxWidth: '80%' },
  myContainer: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  theirContainer: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  bubble: { padding: 12, borderRadius: 20 },
  myBubble: { backgroundColor: '#007AFF', borderBottomRightRadius: 4 },
  theirBubble: { backgroundColor: '#E5E5EA', borderBottomLeftRadius: 4 },
  timestamp: { fontSize: 10, color: '#8E8E93', marginTop: 4, marginHorizontal: 4 }
});