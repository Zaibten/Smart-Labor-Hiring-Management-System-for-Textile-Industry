import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
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
import Profile from "./Profile"; // Profile modal component

const BACKEND_URL = "http://192.168.100.39:3000/api/chat"; // replace with your backend

interface Labour {
  labourId: string | null;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  image: string;
}

interface JobResponse {
  jobId: string;
  jobTitle: string;
  jobDescription: string;
  location: string;
  workersRequired: number;
  appliedAtList: string[];
  labours: Labour[];
}

interface Message {
  sender: "me" | "other";
  text: string;
  timestamp: string;
}

export default function Response() {
  const [contractorEmail, setContractorEmail] = useState<string | null>(null);
  const [jobs, setJobs] = useState<JobResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Chat modal states
  const [chatModalVisible, setChatModalVisible] = useState(false);
  const [chatUserEmail, setChatUserEmail] = useState<string | null>(null); // email to chat with
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const handleChatPress = (email: string) => {
    setChatUserEmail(email);
    setChatModalVisible(true);
    fetchMessages(email);
  };

  const fetchMessages = async (otherUser: string) => {
    if (!contractorEmail) return;
    try {
      const res = await axios.get(`${BACKEND_URL}/${contractorEmail}/${otherUser}`);
      setMessages(res.data.map((msg: any) => ({
        sender: msg.senderEmail === contractorEmail ? "me" : "other",
        text: msg.message,
        timestamp: msg.timestamp,
      })));
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !contractorEmail || !chatUserEmail) return;

    try {
      const res = await axios.post(`${BACKEND_URL}/send`, {
        senderEmail: contractorEmail,
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
    <View style={[styles.messageContainer, item.sender === "me" ? styles.sender : styles.receiver]}>
      <View style={[styles.messageBubble, item.sender === "me" && { backgroundColor: "#34d399" }]}>
        <Text style={styles.messageText}>{item.text}</Text>
        <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
      </View>
    </View>
  );

  // Get contractor email from AsyncStorage
  useEffect(() => {
    const fetchContractorEmail = async () => {
      const userData = await AsyncStorage.getItem("user");
      const user = userData ? JSON.parse(userData) : null;
      if (user?.email) setContractorEmail(user.email);
    };
    fetchContractorEmail();
  }, []);

  // Fetch responses from API
  useEffect(() => {
    if (!contractorEmail) return;

    const fetchResponses = async () => {
      try {
        const response = await fetch(
          `http://192.168.100.39:3000/api/responses-by-contractor/${contractorEmail}`
        );
        if (!response.ok) throw new Error("Failed to fetch responses");
        const data = await response.json();

        const grouped: { [key: string]: JobResponse } = {};
        data.responses.forEach((resp: any) => {
          if (!grouped[resp.jobId]) {
            grouped[resp.jobId] = {
              jobId: resp.jobId,
              jobTitle: resp.jobTitle,
              jobDescription: resp.jobDescription,
              location: resp.location,
              workersRequired: resp.workersRequired,
              appliedAtList: [],
              labours: [],
            };
          }
          grouped[resp.jobId].appliedAtList.push(resp.appliedAt);
          grouped[resp.jobId].labours.push(resp.labour);
        });

        setJobs(Object.values(grouped));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResponses();
  }, [contractorEmail]);

  const openProfileModal = (email: string) => {
    setSelectedEmail(email);
    setModalVisible(true);
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, friction: 8, tension: 40 }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  };

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(opacityAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      setModalVisible(false);
      setSelectedEmail(null);
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        {/* <AppBar title="Job Responses" /> */}
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#fb923c" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* <AppBar title="Job Responses" /> */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {jobs.length === 0 ? (
          <Text style={styles.emptyText}>No responses found for your jobs.</Text>
        ) : (
          jobs.map((job, idx) => (
            <View key={idx} style={styles.jobCard}>
              <Text style={styles.jobTitle}>{job.jobTitle}</Text>
              <Text style={styles.jobDesc}>{job.jobDescription}</Text>
              <Text style={styles.jobInfo}>Location: {job.location}</Text>
              <Text style={styles.jobInfo}>Workers Required: {job.workersRequired}</Text>
              <Text style={styles.jobInfo}>Total Responses: {job.labours.length}</Text>

              {job.labours.map((labour, aidx) => (
                <View key={aidx} style={styles.applicantCard}>
                  <TouchableOpacity onPress={() => openProfileModal(labour.email)}>
                    <Image source={{ uri: labour.image }} style={styles.avatar} />
                  </TouchableOpacity>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.name}>
                      {labour.firstName} {labour.lastName}
                    </Text>
                    <Text style={styles.email}>{labour.email}</Text>
                    <Text style={styles.status}>Role: {labour.role}</Text>
                    <Text style={styles.appliedAt}>
                      Applied At: {new Date(job.appliedAtList[aidx]).toLocaleString()}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleChatPress(labour.email)}
                    style={styles.chatBtn}
                  >
                    <Ionicons name="chatbubble-ellipses-outline" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>

      {/* Profile Modal */}
      <Modal
        transparent
        visible={modalVisible}
        onRequestClose={closeModal}
        animationType="none"
      >
        <Animated.View
          style={{
            flex: 1,
            backgroundColor: opacityAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ["rgba(0,0,0,0)", "rgba(0,0,0,0.7)"],
            }),
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Animated.View
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "#fff",
              borderRadius: 0,
              paddingTop: 60,
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            }}
          >
            <Pressable
              onPress={closeModal}
              style={{
                position: "absolute",
                top: 20,
                right: 20,
                padding: 10,
                zIndex: 10,
              }}
            >
              <Ionicons name="close-circle" size={30} color="#fb923c" />
            </Pressable>
            <ScrollView contentContainerStyle={{ padding: 20 }}>
              {selectedEmail && <Profile email={selectedEmail} />}
            </ScrollView>
          </Animated.View>
        </Animated.View>
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

      <BottomTab tabs={[]} activeTab="" userRole="Contractor" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f3f4f6" },
  scrollContent: { padding: 15, paddingBottom: 120 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  jobCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  jobTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  jobDesc: { fontSize: 14, color: "#1f2937", marginTop: 4 },
  jobInfo: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  applicantCard: {
    flexDirection: "row",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 10,
    marginTop: 10,
    alignItems: "center",
  },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  name: { fontWeight: "700", fontSize: 14, color: "#111827" },
  email: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  status: { fontSize: 12, color: "#fb923c", marginTop: 2 },
  appliedAt: { fontSize: 11, color: "#9ca3af", marginTop: 2 },
  chatBtn: {
    backgroundColor: "#fb923c",
    padding: 8,
    borderRadius: 20,
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
