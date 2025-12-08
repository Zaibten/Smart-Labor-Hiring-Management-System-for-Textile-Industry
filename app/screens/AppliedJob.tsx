import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AppBar from "../components/AppBar";
import BottomTab from "../components/BottomTab";
import Profile from "./Profile"; // Profile modal component

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
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);

  const openProfileModal = (email: string) => {
    setSelectedEmail(email);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedEmail(null);
  };

  const handleChatPress = (email: string) => {
    console.log("Chat with:", email);
    // Navigate to Chat screen or open chat modal
  };

  useEffect(() => {
    const fetchUserJobs = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        const localUser = userData ? JSON.parse(userData) : null;
        if (!localUser?.email) return;

        const response = await fetch(`http://192.168.100.39:3000/api/jobs/user/${localUser.email}`);
        if (!response.ok) throw new Error("Failed to fetch user jobs");
        const data = await response.json();

        setUser({
          firstName: data.user.firstName || "",
          lastName: data.user.lastName || "",
          email: data.user.email || "",
          role: data.user.role === "Contractor" || data.user.role === "Labour" ? data.user.role : undefined,
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
        <AppBar title="My Applied Jobs" />
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#fb923c" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppBar title="My Applied Jobs" />

      {/* User Info */}
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{user.firstName} {user.lastName}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {jobsApplied.length > 0 ? (
          jobsApplied.map((job, index) => (
            <View key={index} style={styles.card}>
              <TouchableOpacity onPress={() => openProfileModal(job.contractor.email)}>
                {/* <Image
                  source={{ uri: job.contractor.image || "https://png.pngtree.com/png-vector/20231019/ourmid/pngtree-user-profile-avatar-png-image_10211467.png" }}
                  style={styles.avatar}
                /> */}
                          <Image source={require("../../assets/images/logo.png")} style={styles.avatar}
/>
                
              </TouchableOpacity>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.name}>{job.contractor.firstName} {job.contractor.lastName}</Text>
                <Text style={styles.email}>{job.contractor.email}</Text>
                <Text style={styles.jobTitle}>Job: {job.title}</Text>
                <Text style={styles.appliedAt}>Applied At: {new Date(job.appliedAt).toLocaleString()}</Text>
              </View>
              <TouchableOpacity onPress={() => handleChatPress(job.contractor.email)} style={styles.chatBtn}>
                <Ionicons name="chatbubble-ellipses-outline" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>You have not applied to any jobs yet.</Text>
        )}
      </ScrollView>

      {/* Profile Modal */}
      <Modal visible={modalVisible} animationType="fade" transparent={false} onRequestClose={closeModal}>
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

      <BottomTab tabs={[]} activeTab="" userRole={user.role} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f3f4f6" },
  userInfo: { padding: 15, backgroundColor: "#fff", borderBottomWidth: 1, borderColor: "#e5e7eb", marginBottom: 10 },
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
});
