import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
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

export default function Response() {
  const [contractorEmail, setContractorEmail] = useState<string | null>(null);
  const [jobs, setJobs] = useState<JobResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Get contractor email from AsyncStorage
  useEffect(() => {
    const fetchContractorEmail = async () => {
      const userData = await AsyncStorage.getItem("user");
      const user = userData ? JSON.parse(userData) : null;
      if (user?.email) {
        setContractorEmail(user.email);
      }
    };
    fetchContractorEmail();
  }, []);

  // Fetch responses from API
  useEffect(() => {
    if (!contractorEmail) return;

    const fetchResponses = async () => {
      try {
        const response = await fetch(`http://192.168.100.39:3000/api/responses-by-contractor/${contractorEmail}`);
        if (!response.ok) throw new Error("Failed to fetch responses");
        const data = await response.json();

        // Group responses by job
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

  const handleChatPress = (email: string) => {
    console.log("Chat with:", email);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AppBar title="Job Responses" />
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#fb923c" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppBar title="Job Responses" />
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
                    <Text style={styles.name}>{labour.firstName} {labour.lastName}</Text>
                    <Text style={styles.email}>{labour.email}</Text>
                    <Text style={styles.status}>Role: {labour.role}</Text>
                    <Text style={styles.appliedAt}>Applied At: {new Date(job.appliedAtList[aidx]).toLocaleString()}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleChatPress(labour.email)} style={styles.chatBtn}>
                    <Ionicons name="chatbubble-ellipses-outline" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>

      {/* Profile Modal */}
      <Modal transparent visible={modalVisible} onRequestClose={closeModal}>
        <Animated.View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: opacityAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ["rgba(0,0,0,0)", "rgba(0,0,0,0.5)"],
            }),
          }}
        >
          <Animated.View
            style={{
              width: "90%",
              maxHeight: "90%",
              backgroundColor: "#fff",
              borderRadius: 12,
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            }}
          >
            <Pressable onPress={closeModal} style={{ position: "absolute", top: 10, right: 10, padding: 5 }}>
              <Text style={{ fontSize: 18, fontWeight: "700" }}>X</Text>
            </Pressable>
            {selectedEmail && <Profile email={selectedEmail} />}
          </Animated.View>
        </Animated.View>
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
});
