import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AppBar from "../components/AppBar";
import BottomTab from "../components/BottomTab";

const BACKEND_URL = "https://labour-server.vercel.app/api/chat";

interface ChatItem {
  email: string;
  lastMessage: string;
  timestamp: string;
}



const labourTabs = [
  { label: "Home", icon: "home" },
  { label: "Find Jobs", icon: "search" },
  { label: "Chats", icon: "chatbubbles" },
  { label: "Settings", icon: "settings" },
];



  const contractorTabs = [
    { label: "Home", icon: "home" },
    { label: "Create Jobs", icon: "add-circle" },
    { label: "All Jobs", icon: "list" },
    { label: "Chats", icon: "chatbubbles" },
    { label: "Settings", icon: "settings" },
  ];

interface Message {
  sender: "me" | "other";
  text: string;
  timestamp: string;
}

export default function ChatList() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [chatUsers, setChatUsers] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Chat Modal
  const [chatModalVisible, setChatModalVisible] = useState(false);
  const [chatUserEmail, setChatUserEmail] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const flatListRef = useRef<FlatList>(null);


  const [userRole, setUserRole] = useState<"Contractor" | "Labour">("Labour");

const loadUser = async () => {
  const userData = await AsyncStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null;

  if (user?.role) setUserRole(user.role);   // <-- SAVE ROLE

  if (user?.email) {
    setUserEmail(user.email);
    fetchChatList(user.email);
  }
};

  useEffect(() => {
    loadUser();
  }, []);

  // const loadUser = async () => {
  //   try {
  //     const userData = await AsyncStorage.getItem("user");
  //     const user = userData ? JSON.parse(userData) : null;

  //     if (!user?.email) return;

  //     setUserEmail(user.email);
  //     fetchChatList(user.email);
  //   } catch (err) {
  //     console.log(err);
  //   }
  // };

  const fetchChatList = async (email: string) => {
    try {
      const res = await axios.get(`${BACKEND_URL}/all/${email}`);
      setChatUsers(res.data);
    } catch (err) {
      console.log("Error fetching chat users:", err);
    } finally {
      setLoading(false);
    }
  };

  const openChatModal = async (otherEmail: string) => {
    setChatUserEmail(otherEmail);
    setChatModalVisible(true);
    fetchMessages(otherEmail);
  };

  const fetchMessages = async (otherEmail: string) => {
    if (!userEmail) return;

    try {
      const res = await axios.get(`${BACKEND_URL}/${userEmail}/${otherEmail}`);

      setMessages(
        res.data.map((msg: any) => ({
          sender: msg.senderEmail === userEmail ? "me" : "other",
          text: msg.message,
          timestamp: msg.timestamp,
        }))
      );

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 200);
    } catch (error) {
      console.log("Failed to load messages:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !userEmail || !chatUserEmail) return;

    try {
      const res = await axios.post(`${BACKEND_URL}/send`, {
        senderEmail: userEmail,
        receiverEmail: chatUserEmail,
        message: newMessage,
      });

      setMessages(prev => [
        ...prev,
        { sender: "me", text: newMessage, timestamp: res.data.timestamp },
      ]);

      setNewMessage("");

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 200);
    } catch (err) {
      console.log("Send message error:", err);
    }
  };

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#fb923c" />
      </View>
    );

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
  
  {/* 🔥 TOP APP BAR ADDED HERE */}
  <AppBar title="Chats" />

  <View style={{ paddingHorizontal: 15, paddingTop: 10 }}>
  </View>


      <FlatList
        data={chatUsers}
        keyExtractor={(item) => item.email}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.chatRow}
            onPress={() => openChatModal(item.email)}
          >
            <Image
              source={require("../../assets/images/logo.png")}
              style={styles.avatar}
            />

            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.email}</Text>
              <Text style={styles.lastMsg}>{item.lastMessage}</Text>
            </View>

            <Text style={styles.time}>
              {new Date(item.timestamp).toLocaleTimeString()}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* CHAT MODAL */}
      <Modal visible={chatModalVisible} animationType="slide">
        <View style={{ flex: 1, backgroundColor: "#fff" }}>

          {/* CHAT HEADER */}
          <View style={styles.chatHeader}>
            <Pressable onPress={() => setChatModalVisible(false)}>
              <Ionicons name="close" size={30} color="#fb923c" />
            </Pressable>

            <Text style={styles.chatHeaderText}>
              Chat with {chatUserEmail}
            </Text>

            <View style={{ width: 30 }} /> 
          </View>

          {/* MESSAGES */}
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.messageRow,
                  item.sender === "me"
                    ? styles.myMsg
                    : styles.otherMsg,
                ]}
              >
                <Text style={styles.msgText}>{item.text}</Text>
                <Text style={styles.msgTime}>
                  {new Date(item.timestamp).toLocaleTimeString()}
                </Text>
              </View>
            )}
            keyExtractor={(_, i) => i.toString()}
            contentContainerStyle={{ padding: 10 }}
          />

          {/* input box */}
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.inputWrapper}
          >
            <TextInput
              style={styles.input}
              placeholder="Type message..."
              value={newMessage}
              onChangeText={setNewMessage}
            />
            <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
              <Ionicons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <View style={styles.tabWrapper}>
  <BottomTab
    tabs={userRole === "Contractor" ? contractorTabs : labourTabs}
    activeTab="Chats"
    userRole={userRole}
  />
</View>

    </View>
  );
}

const styles = StyleSheet.create({
  header: { fontSize: 28, fontWeight: "700", margin: 20 },

  chatRow: {
    flexDirection: "row",
    padding: 15,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
  },

  avatar: { width: 55, height: 55, borderRadius: 30, marginRight: 12 },
  name: { fontSize: 16, fontWeight: "600" },
  lastMsg: { color: "#6b7280", marginTop: 4 },
  time: { fontSize: 12, color: "#9ca3af" },

  /* CHAT HEADER */
  chatHeader: {
    height: 65,
    backgroundColor: "#fef3c7",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    justifyContent: "space-between",
  },
  chatHeaderText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fb923c",
  },

  /* Messages */
  messageRow: {
    maxWidth: "75%",
    padding: 10,
    borderRadius: 12,
    marginVertical: 6,
  },
  myMsg: { backgroundColor: "#34d399", alignSelf: "flex-end" },
  otherMsg: { backgroundColor: "#fb923c", alignSelf: "flex-start" },
  msgText: { color: "#fff" },
  msgTime: { fontSize: 10, color: "#fff", marginTop: 4 },

  /* Input Box */
  inputWrapper: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#f3f4f6",
  },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
  },
  sendBtn: {
    backgroundColor: "#fb923c",
    padding: 12,
    borderRadius: 20,
  },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  tabWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
});
