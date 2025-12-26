import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const BACKEND_URL = "http://172.23.212.221:3000/api/chat"; // replace with your backend

interface Message {
  sender: "me" | "other";
  text: string;
  timestamp: string;
}



export default function ChatModal() {
  const [messages, setMessages] = useState<Message[]>([]); // <--- Explicit type
  const [newMessage, setNewMessage] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const [user1, setUser1] = useState(""); // current logged-in user
  const user2 = "muzi@gmail.com"; // hardcoded

  useEffect(() => {
    const fetchUserAndMessages = async () => {
      const storedUser = await AsyncStorage.getItem("userEmail");
      if (!storedUser) return;
      setUser1(storedUser);

      // Fetch chats
      const res = await axios.get(`${BACKEND_URL}/${storedUser}/${user2}`);
      setMessages(res.data.map((msg: any) => ({
        sender: msg.senderEmail === storedUser ? "me" : "other",
        text: msg.message,
        timestamp: msg.timestamp,
      })));
    };

    fetchUserAndMessages();
  }, []);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user1) return;

    // Send to backend
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
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const renderItem = ({ item }: { item: Message }) => (
    <View style={[styles.messageContainer, item.sender === "me" ? styles.sender : styles.receiver]}>
      <View style={[styles.messageBubble, item.sender === "me" && { backgroundColor: "#34d399" }]}>
        <Text style={styles.messageText}>{item.text}</Text>
        <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 10 }}
      />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={styles.inputContainer}>
          <TextInput
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message"
            style={styles.input}
          />
          <TouchableOpacity onPress={sendMessage} style={styles.sendBtn}>
            <Text style={{ color: "#fff" }}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  messageContainer: { flexDirection: "row", marginBottom: 10 },
  sender: { justifyContent: "flex-end", alignSelf: "flex-end" },
  receiver: { justifyContent: "flex-start", alignSelf: "flex-start" },
  messageBubble: { maxWidth: "75%", backgroundColor: "#fb923c", padding: 10, borderRadius: 12 },
  messageText: { color: "#fff" },
  timestamp: { color: "#fff", fontSize: 10, marginTop: 4, alignSelf: "flex-end" },
  inputContainer: { flexDirection: "row", padding: 10, backgroundColor: "#fff", alignItems: "center" },
  input: { flex: 1, borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 20, paddingHorizontal: 15, paddingVertical: 8, marginRight: 10 },
  sendBtn: { backgroundColor: "#fb923c", padding: 10, borderRadius: 20 },
});
