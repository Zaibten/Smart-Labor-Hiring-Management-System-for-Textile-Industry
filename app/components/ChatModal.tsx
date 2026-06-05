import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const BACKEND_URL = "https://labourhubserver.vercel.app/api/chat";

interface Message {
  sender: "me" | "other";
  text: string;
  timestamp: string;
}

export default function ChatModal() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const [user1, setUser1] = useState("");
  const user2 = "muzi@gmail.com";

  useEffect(() => {
    const fetchUserAndMessages = async () => {
      const storedUser = await AsyncStorage.getItem("userEmail");
      if (!storedUser) return;
      setUser1(storedUser);

      const res = await axios.get(`${BACKEND_URL}/${storedUser}/${user2}`);
      setMessages(
        res.data.map((msg: any) => ({
          sender: msg.senderEmail === storedUser ? "me" : "other",
          text: msg.message,
          timestamp: msg.timestamp,
        })),
      );
    };

    fetchUserAndMessages();
  }, []);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user1) return;

    const res = await axios.post(`${BACKEND_URL}/send`, {
      senderEmail: user1,
      receiverEmail: user2,
      message: newMessage,
    });

    setMessages((prev: Message[]) => [
      ...prev,
      { sender: "me", text: newMessage, timestamp: res.data.timestamp },
    ]);

    setNewMessage("");
  };

  const renderItem = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.sender === "me" ? styles.sender : styles.receiver,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          item.sender === "me" && { backgroundColor: "#34d399" },
        ]}
      >
        <Text style={styles.messageText}>{item.text}</Text>
        <Text style={styles.timestamp}>
          {new Date(item.timestamp).toLocaleTimeString()}
        </Text>
      </View>
    </View>
  );

  return (
    // ✅ FIX 1: The outer wrapper must be flex:1 so the inner FlatList
    // gets a bounded height and doesn't overflow into the parent screen scroll.
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      {/* ✅ FIX 2: FlatList wrapper must be flex:1 to constrain scroll area */}
      <View style={styles.listWrapper}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(_, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          // ✅ FIX 3: nestedScrollEnabled prevents touch events from
          // bubbling up to any parent ScrollView/FlatList on Android
          nestedScrollEnabled={true}
          // ✅ FIX 4: onScrollBeginDrag stops parent scroll when user
          // starts scrolling inside this list (critical for iOS)
          onScrollBeginDrag={(e) => e.stopPropagation?.()}
          // Keep latest messages in view when keyboard opens
          maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
          showsVerticalScrollIndicator={true}
          // ✅ FIX 5: scroll to bottom on initial load
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: false })
          }
          // ✅ FIX 6: also scroll when layout changes (e.g. keyboard appears)
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message"
          style={styles.input}
          // ✅ FIX 7: prevent input focus from triggering parent scroll
          onFocus={() => {
            setTimeout(() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }, 300);
          }}
          returnKeyType="send"
          onSubmitEditing={sendMessage}
          blurOnSubmit={false}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendBtn}>
          <Text style={{ color: "#fff" }}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  // ✅ FIX: flex:1 is the key — gives the component a bounded height
  // so FlatList knows where to stop and scrolls within itself
  container: {
    flex: 1,
  },
  // ✅ FIX: listWrapper takes all available space above the input bar
  listWrapper: {
    flex: 1,
  },
  listContent: {
    padding: 10,
    paddingBottom: 8,
    // ✅ Ensures content grows from top — latest messages appear at bottom
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  messageContainer: {
    flexDirection: "row",
    marginBottom: 10,
  },
  sender: {
    justifyContent: "flex-end",
    alignSelf: "flex-end",
  },
  receiver: {
    justifyContent: "flex-start",
    alignSelf: "flex-start",
  },
  messageBubble: {
    maxWidth: "75%",
    backgroundColor: "#fb923c",
    padding: 10,
    borderRadius: 12,
  },
  messageText: {
    color: "#fff",
  },
  timestamp: {
    color: "#fff",
    fontSize: 10,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#fff",
    alignItems: "center",
    // ✅ Prevents input bar from scrolling away
    borderTopWidth: 0.5,
    borderTopColor: "#e5e7eb",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
  },
  sendBtn: {
    backgroundColor: "#fb923c",
    padding: 10,
    borderRadius: 20,
  },
});
