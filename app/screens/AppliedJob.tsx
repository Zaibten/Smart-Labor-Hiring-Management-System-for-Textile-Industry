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
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import BottomTab from "../components/BottomTab";
import Profile from "./Profile";

const BACKEND_URL = "http://172.23.212.221:3000/api/chat"; // replace with your backend

interface Contractor {
  firstName: string;
  lastName: string;
  email: string;
  role: "Contractor" | "Labour";
  image?: string;
}

interface AppliedJob {
  jobId: string;
  title: string;
  status: string;
  appliedAt: string;
  contractor: Contractor;
}

interface Message {
  sender: "me" | "other";
  text: string;
  timestamp: string;
}

export default function Response() {
  const [user, setUser] = useState<{
    firstName: string;
    lastName: string;
    email?: string;
    role: "Contractor" | "Labour" | undefined;
    image?: string;
  }>({ firstName: "", lastName: "", role: undefined });

  const [jobsApplied, setJobsApplied] = useState<AppliedJob[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);

  // Chat modal states
  const [chatModalVisible, setChatModalVisible] = useState(false);
  const [chatUserEmail, setChatUserEmail] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const openProfileModal = (email: string) => {
    setSelectedEmail(email);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedEmail(null);
  };

  const handleChatPress = (email: string) => {
    setChatUserEmail(email);
    setChatModalVisible(true);
    fetchMessages(email);
  };

  const fetchMessages = async (otherUser: string) => {
    if (!user.email) return;
    try {
      const res = await axios.get(`${BACKEND_URL}/${user.email}/${otherUser}`);
      setMessages(
        res.data.map((msg: any) => ({
          sender: msg.senderEmail === user.email ? "me" : "other",
          text: msg.message,
          timestamp: msg.timestamp,
        }))
      );
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user.email || !chatUserEmail) return;
    try {
      const res = await axios.post(`${BACKEND_URL}/send`, {
        senderEmail: user.email,
        receiverEmail: chatUserEmail,
        message: newMessage,
      });
      setMessages(prev => [
        ...prev,
        { sender: "me", text: newMessage, timestamp: res.data.timestamp },
      ]);
      setNewMessage("");
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (err) {
      console.error(err);
    }
  };

  const renderMessageItem = ({ item }: { item: Message }) => (
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

  useEffect(() => {
    const fetchUserJobs = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        const localUser = userData ? JSON.parse(userData) : null;
        if (!localUser?.email) return;

        const response = await fetch(
          `http://172.23.212.221:3000/api/jobs/user/${localUser.email}`
        );
        if (!response.ok) throw new Error("Failed to fetch user jobs");
        const data = await response.json();

        setUser({
          firstName: data.user.firstName || "",
          lastName: data.user.lastName || "",
          email: data.user.email || "",
          role:
            data.user.role === "Contractor" || data.user.role === "Labour"
              ? data.user.role
              : undefined,
          image: data.user.image,
        });

        setJobsApplied(data.jobsApplied || []);
      } catch (err) {
        console.error("Error fetching applied jobs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserJobs();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        {/* <AppBar title="My Applied Jobs" /> */}
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#fb923c" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* <AppBar title="My Applied Jobs" /> */}

      {/* User Info */}
      <View style={styles.userInfo}>
        <Text style={styles.userName}>
          {user.firstName} {user.lastName}
        </Text>
        <Text style={styles.userEmail}>{user.email}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {jobsApplied.length > 0 ? (
          jobsApplied.map((job, index) => (
            <View key={index} style={styles.card}>
              <TouchableOpacity onPress={() => openProfileModal(job.contractor.email)}>
                <Image
                  source={
                    job.contractor.image
                      ? { uri: job.contractor.image }
                      : require("../../assets/images/logo.png")
                  }
                  style={styles.avatar}
                />
              </TouchableOpacity>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.name}>
                  {job.contractor.firstName} {job.contractor.lastName}
                </Text>
                <Text style={styles.email}>{job.contractor.email}</Text>
                <Text style={styles.jobTitle}>Job: {job.title}</Text>
                <Text style={styles.appliedAt}>
                  Applied At: {new Date(job.appliedAt).toLocaleString()}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => handleChatPress(job.contractor.email)}
                style={styles.chatBtn}
              >
                <Ionicons name="chatbubble-ellipses-outline" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>You have not applied to any jobs yet.</Text>
        )}
      </ScrollView>

      {/* Profile Modal */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent={false}
        onRequestClose={closeModal}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
          <Pressable
            onPress={closeModal}
            style={{
              position: "absolute",
              top: 10,
              right: 15,
              zIndex: 10,
              padding: 10,
              backgroundColor: "#fff",
              borderRadius: 25,
              elevation: 3,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "700" }}>X</Text>
          </Pressable>

          {selectedEmail && <Profile email={selectedEmail} />}
        </SafeAreaView>
      </Modal>

      {/* Chat Modal */}
      <Modal
        transparent
        visible={chatModalVisible}
        onRequestClose={() => setChatModalVisible(false)}
        animationType="slide"
      >
        <View style={{ flex: 1, backgroundColor: "#fff", paddingTop: 40 }}>
          <Pressable
            onPress={() => setChatModalVisible(false)}
            style={{ position: "absolute", top: 40, right: 20, zIndex: 10 }}
          >
            <Ionicons name="close-circle" size={30} color="#fb923c" />
          </Pressable>

          {chatUserEmail && (
            <>
              <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(_, index) => index.toString()}
                renderItem={renderMessageItem}
                contentContainerStyle={{ padding: 10 }}
              />

              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ padding: 10, backgroundColor: "#f3f4f6" }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <TextInput
                    value={newMessage}
                    onChangeText={setNewMessage}
                    placeholder="Type a message"
                    style={{
                      flex: 1,
                      borderWidth: 1,
                      borderColor: "#e5e7eb",
                      borderRadius: 20,
                      paddingHorizontal: 15,
                      paddingVertical: 8,
                      marginRight: 10,
                      backgroundColor: "#fff",
                    }}
                  />
                  <TouchableOpacity
                    onPress={sendMessage}
                    style={{
                      backgroundColor: "#fb923c",
                      padding: 10,
                      borderRadius: 20,
                    }}
                  >
                    <Text style={{ color: "#fff" }}>Send</Text>
                  </TouchableOpacity>
                </View>
              </KeyboardAvoidingView>
            </>
          )}
        </View>
      </Modal>

      <BottomTab tabs={[]} activeTab="" userRole={user.role} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f3f4f6" },
  userInfo: {
    padding: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 10,
  },
  userName: { fontSize: 18, fontWeight: "700", color: "#111827" },
  userEmail: { fontSize: 14, color: "#6b7280", marginTop: 2 },
  scrollContent: { padding: 15, paddingBottom: 120 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
    alignItems: "center",
  },
  avatar: { width: 60, height: 60, borderRadius: 30 },
  name: { fontWeight: "700", fontSize: 16, color: "#111827" },
  email: { fontSize: 14, color: "#6b7280", marginTop: 2 },
  jobTitle: { fontSize: 14, color: "#1f2937", marginTop: 4 },
  appliedAt: { fontSize: 12, color: "#9ca3af", marginTop: 4 },
  chatBtn: {
    backgroundColor: "#fb923c",
    padding: 10,
    borderRadius: 25,
    marginLeft: 10,
  },
  emptyText: { fontSize: 14, color: "#6b7280", textAlign: "center", marginTop: 20 },
  messageContainer: { flexDirection: "row", marginBottom: 10 },
  sender: { justifyContent: "flex-end", alignSelf: "flex-end" },
  receiver: { justifyContent: "flex-start", alignSelf: "flex-start" },
  messageBubble: { maxWidth: "75%", backgroundColor: "#fb923c", padding: 10, borderRadius: 12 },
  messageText: { color: "#fff" },
  timestamp: { color: "#fff", fontSize: 10, marginTop: 4, alignSelf: "flex-end" },
});
