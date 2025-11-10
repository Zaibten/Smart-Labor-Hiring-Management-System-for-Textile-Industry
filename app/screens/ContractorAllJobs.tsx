import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import AppBar from "../components/AppBar";
import BottomTab from "../components/BottomTab";

interface Job {
  _id: string;
  title: string;
  description: string;
  location: string;
  workersRequired: number;
  skill: string;
  budget: number;
  contact: string;
  startDate: string;
  endDate: string;
  createdBy: {
    userId: string;
    firstName: string;
    lastName: string;
    role: string;
    email: string;
  };
}

export default function AllJobs() {
  const [user, setUser] = useState({
    _id: "",
    firstName: "",
    lastName: "",
    role: "",
    email: "",
    image: "",
  });
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"myJobs" | "allJobs">("allJobs");

  const contractorTabs = [
    { label: "Home", icon: "home" },
    { label: "Create Jobs", icon: "add-circle" },
    { label: "All Jobs", icon: "list" },
    { label: "Chats", icon: "chatbubbles" },
    { label: "Settings", icon: "settings" },
  ];

  useEffect(() => {
    const fetchUserAndJobs = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);

          await AsyncStorage.setItem("userEmail", parsedUser.email);

          const resAll = await fetch("http://192.168.100.37:3000/api/alljobs");
          const jobsAll = await resAll.json();
          setAllJobs(jobsAll);

          if (parsedUser.role === "Contractor") {
            const email = parsedUser.email;
            const resMine = await fetch(`http://192.168.100.37:3000/api/my-jobs-email/${email}`);
            const jobsMine = await resMine.json();
            setMyJobs(jobsMine);
          }
        }
      } catch (err) {
        console.error("Error fetching jobs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndJobs();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AppBar title="All Jobs" />
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#fb923c" />
        </View>
        <BottomTab tabs={contractorTabs} activeTab="All Jobs" userRole="Contractor" />
      </SafeAreaView>
    );
  }

  // Job card with fade-in animation
  const renderJob = (job: Job) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 6, useNativeDriver: true }),
      ]).start();
    }, []);

    return (
      <Animated.View key={job._id} style={[styles.jobCard, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        {/* Role Tag */}
        <View style={[styles.roleTag, job.createdBy.role === "Contractor" ? styles.contractorTag : styles.labourTag]}>
          <Text style={styles.roleTagText}>{job.createdBy.role}</Text>
        </View>

        <Text style={styles.jobTitle}>{job.title}</Text>
        <Text style={styles.jobText}>Description: {job.description}</Text>
        <Text style={styles.jobText}>Location: {job.location}</Text>
        <Text style={styles.jobText}>Skill: {job.skill}</Text>
        <Text style={styles.jobText}>Workers: {job.workersRequired}</Text>
        <Text style={styles.jobText}>Budget: ${job.budget}</Text>
        <Text style={styles.jobText}>
          Start: {new Date(job.startDate).toLocaleDateString()} | End: {new Date(job.endDate).toLocaleDateString()}
        </Text>
        <Text style={styles.jobText}>
          Created By: {job.createdBy.firstName} {job.createdBy.lastName}
        </Text>
      </Animated.View>
    );
  };

  const jobsToShow = activeTab === "myJobs" ? myJobs : allJobs;

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppBar title="Jobs" />
      <View style={styles.tabContainer}>
        {user.role === "Contractor" && (
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "myJobs" && styles.activeTab]}
            onPress={() => setActiveTab("myJobs")}
          >
            <Text style={[styles.tabText, activeTab === "myJobs" && styles.activeTabText]}>My Jobs</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "allJobs" && styles.activeTab]}
          onPress={() => setActiveTab("allJobs")}
        >
          <Text style={[styles.tabText, activeTab === "allJobs" && styles.activeTabText]}>All Jobs</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {jobsToShow.length > 0 ? jobsToShow.map(renderJob) : (
          <Text style={styles.emptyText}>
            {activeTab === "myJobs" ? "You haven't created any jobs yet." : "No jobs available."}
          </Text>
        )}
      </ScrollView>
      <BottomTab tabs={contractorTabs} activeTab="All Jobs" userRole="Contractor" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f9fafb" },
  scrollContent: { padding: 15, paddingBottom: 120 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },

  tabContainer: { flexDirection: "row", justifyContent: "space-around", marginVertical: 10 },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 25,
    borderRadius: 25,
    backgroundColor: "#e5e7eb",
  },
  activeTab: { backgroundColor: "#fb923c" },
  tabText: { fontWeight: "700", color: "#111827" },
  activeTabText: { color: "#fff" },

  jobCard: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  roleTag: {
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 10,
  },
  contractorTag: { backgroundColor: "#f97316" },
  labourTag: { backgroundColor: "#10b981" },
  roleTagText: { color: "#fff", fontWeight: "700", fontSize: 12 },

  jobTitle: { fontSize: 18, fontWeight: "700", marginBottom: 6, color: "#111827" },
  jobText: { fontSize: 14, color: "#374151", marginBottom: 4 },
  emptyText: { fontSize: 14, color: "#6b7280", fontStyle: "italic", marginVertical: 5 },
});
