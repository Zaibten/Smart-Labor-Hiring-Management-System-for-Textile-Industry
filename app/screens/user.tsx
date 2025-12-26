import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import AppBar from "../components/AppBar";
import BottomTab from "../components/BottomTab";

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  image: string;
  skills: string[];
  role: "Labour" | "Contractor";
  badge: string;
}

interface ChatMessage {
  senderEmail: string;
  receiverEmail: string;
  message: string;
  timestamp: string;
}

interface Profile {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    image: string;
    createdAt: string;
  };
  stats: {
    totalJobsPosted: number;
    totalJobsApplied: number;
    totalApplicantsOnJobs: number;
  };
}

const API_URL = "http://172.23.212.221:3000/api/users";

export default function UsersScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [nameSearch, setNameSearch] = useState("");
  const [skillSearch, setSkillSearch] = useState("");

  const [chatModalVisible, setChatModalVisible] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentReceiver, setCurrentReceiver] = useState("");
  const [newMessage, setNewMessage] = useState("");

  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [profileData, setProfileData] = useState<Profile | null>(null);
  const [userEmail, setUserEmail] = useState("");

  const [userRole, setUserRole] = useState<"Contractor" | "Labour">("Labour");

//   const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);


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

  // Fetch logged-in user email & role
  useEffect(() => {
    const fetchUser = async () => {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUserEmail(parsedUser.email);
        if (parsedUser.role) setUserRole(parsedUser.role);
      }
    };
    fetchUser();
  }, []);

  // Fetch users
  const fetchUsers = async (name = "", skill = "") => {
    try {
      setLoading(true);
      const params: any = {};
      if (name.trim()) params.q = name;
      if (skill.trim()) params.skill = skill;

      const res = await axios.get(API_URL, { params });
      setUsers(res.data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search effect
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      fetchUsers(nameSearch, skillSearch);
    }, 500); // 500ms delay after user stops typing
  }, [nameSearch, skillSearch]);

  const handleRefresh = () => {
    setNameSearch("");
    setSkillSearch("");
    fetchUsers();
  };

  // Open chat
  const openChat = async (receiverEmail: string) => {
    setCurrentReceiver(receiverEmail);
    setChatModalVisible(true);

    try {
      const res = await axios.get(
        `http://172.23.212.221:3000/api/chat/${userEmail}/${receiverEmail}`
      );
      setChatMessages(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      const res = await axios.post(
        "http://172.23.212.221:3000/api/chat/send",
        {
          senderEmail: userEmail,
          receiverEmail: currentReceiver,
          message: newMessage,
        }
      );
      setChatMessages((prev) => [...prev, res.data]);
      setNewMessage("");
    } catch (err) {
      console.error(err);
    }
  };

  // Open profile
  const openProfile = async (email: string) => {
    try {
      const res = await axios.get(`http://172.23.212.221:3000/api/profile/${email}`);
      setProfileData(res.data);
      setProfileModalVisible(true);
    } catch (err) {
      console.error(err);
    }
  };

  const renderUser = ({ item }: { item: User }) => (
    <View style={styles.card}>
      <TouchableOpacity onPress={() => openProfile(item.email)}>
        <Image source={{ uri: item.image }} style={styles.avatar} />
      </TouchableOpacity>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text
          style={[
            styles.badge,
            { backgroundColor: item.role === "Contractor" ? "#2563eb" : "#16a34a" },
          ]}
        >
          {item.badge}
        </Text>
        <Text style={styles.skills}>
          {item.skills.length ? item.skills.join(", ") : "No skills added"}
        </Text>
        <TouchableOpacity onPress={() => openChat(item.email)} style={styles.chatBtn}>
          <Text style={{ color: "#fff" }}>💬 Chat</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading)
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fb923c" />
      </View>
    );

  return (
    <View style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
      <AppBar title="Users" />
      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        renderItem={renderUser}
        contentContainerStyle={{ paddingBottom: 80, paddingHorizontal: 16 }}
        ListHeaderComponent={
          <>
            <TextInput
              placeholder="Search by name"
              value={nameSearch}
              onChangeText={setNameSearch}
              style={styles.search}
            />
            <TextInput
              placeholder="Search by skill"
              value={skillSearch}
              onChangeText={setSkillSearch}
              style={[styles.search, { marginTop: 8 }]}
            />
            <TouchableOpacity
              onPress={handleRefresh}
              style={{ alignSelf: "flex-end", marginVertical: 8 }}
            >
              <Text style={{ fontSize: 18 }}>⟳</Text>
            </TouchableOpacity>
          </>
        }
      />

      {/* Chat Modal */}
      <Modal visible={chatModalVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalBg}
          onPress={() => setChatModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
              Chat with {currentReceiver}
            </Text>
            <ScrollView style={{ flex: 1, marginBottom: 10 }}>
              {chatMessages.map((msg, i) => (
                <View
                  key={i}
                  style={{
                    alignSelf: msg.senderEmail === userEmail ? "flex-end" : "flex-start",
                    marginBottom: 5,
                  }}
                >
                  <View
                    style={[
                      styles.chatBubble,
                      {
                        backgroundColor:
                          msg.senderEmail === userEmail ? "#0a66c2" : "#e0e0e0",
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: msg.senderEmail === userEmail ? "#fff" : "#000",
                      }}
                    >
                      {msg.message}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 10, color: "#555" }}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </Text>
                </View>
              ))}
            </ScrollView>
            <View style={{ flexDirection: "row", gap: 5 }}>
              <TextInput
                value={newMessage}
                onChangeText={setNewMessage}
                placeholder="Type a message..."
                style={styles.messageInput}
              />
              <TouchableOpacity onPress={sendMessage} style={styles.sendBtn}>
                <Text style={{ color: "#fff" }}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Profile Modal */}
      <Modal visible={profileModalVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalBg}
          onPress={() => setProfileModalVisible(false)}
        >
          {profileData && (
            <View style={styles.modalContent}>
              <Text style={{ fontWeight: "bold", fontSize: 18, textAlign: "center" }}>
                {profileData.user.firstName} {profileData.user.lastName}
              </Text>
              <Image
                source={{ uri: profileData.user.image }}
                style={{ width: 100, height: 100, borderRadius: 50, alignSelf: "center", marginVertical: 10 }}
              />
              <Text>
                <Text style={{ fontWeight: "bold" }}>Email:</Text> {profileData.user.email}
              </Text>
              <Text>
                <Text style={{ fontWeight: "bold" }}>Role:</Text> {profileData.user.role}
              </Text>
              <Text>
                <Text style={{ fontWeight: "bold" }}>Joined:</Text>{" "}
                {new Date(profileData.user.createdAt).toLocaleDateString()}
              </Text>
              <View style={{ borderBottomWidth: 1, borderColor: "#ccc", marginVertical: 5 }} />
              <Text>
                <Text style={{ fontWeight: "bold" }}>Total Jobs Posted:</Text>{" "}
                {profileData.stats.totalJobsPosted}
              </Text>
              <Text>
                <Text style={{ fontWeight: "bold" }}>Total Jobs Applied:</Text>{" "}
                {profileData.stats.totalJobsApplied}
              </Text>
              <Text>
                <Text style={{ fontWeight: "bold" }}>Total Applicants On Jobs:</Text>{" "}
                {profileData.stats.totalApplicantsOnJobs}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </Modal>

      <View style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
        <BottomTab
          tabs={userRole === "Contractor" ? contractorTabs : labourTabs}
          activeTab=""
          userRole={userRole}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  search: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 10, marginVertical: 5 },
  card: {
    flexDirection: "row",
    gap: 12,
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  avatar: { width: 60, height: 60, borderRadius: 30 },
  name: { fontSize: 16, fontWeight: "bold" },
  badge: {
    color: "#fff",
    padding: 4,
    borderRadius: 12,
    fontSize: 12,
    marginTop: 4,
    alignSelf: "flex-start",
  },
  skills: { fontSize: 13, color: "#555", marginTop: 6 },
  chatBtn: {
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: "#2563eb",
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  modalBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 16 },
  modalContent: { backgroundColor: "#fff", borderRadius: 10, padding: 16, maxHeight: "80%" },
  chatBubble: { padding: 8, borderRadius: 10, maxWidth: "70%" },
  messageInput: { flex: 1, borderWidth: 1, borderColor: "#ccc", borderRadius: 5, padding: 5 },
  sendBtn: { paddingHorizontal: 12, justifyContent: "center", backgroundColor: "#0a66c2", borderRadius: 5 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
});
