import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useRef, useState } from "react";
import Profile from "./Profile";

import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
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
import AppBar from "../components/AppBar";
import BottomTab from "../components/BottomTab";

interface Applicant {
  laborId: string;
  laborEmail: string;
  appliedAt: string;
}

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
  createdAt: string;
  noOfWorkersApplied: number;
  createdBy: {
    userId: string;
    firstName: string;
    lastName: string;
    role: string;
    email: string;
    createdAt: string;
  };
  applicants: Applicant[]; // <-- Add this
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
  const [userImages, setUserImages] = useState<{ [email: string]: string }>({});
  const [modalVisible, setModalVisible] = useState(false);
const [modalText, setModalText] = useState("");
const scaleAnim = useRef(new Animated.Value(0)).current;
const opacityAnim = useRef(new Animated.Value(0)).current;

const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
const [appliedJobs, setAppliedJobs] = useState<{ [jobId: string]: boolean }>({});

const checkIfApplied = async (jobId: string) => {
  try {
    const res = await fetch(`http://192.168.100.39:3000/api/check-application/${jobId}?email=${user.email}`);
    const data = await res.json();
    setAppliedJobs(prev => ({ ...prev, [jobId]: data.applied }));
  } catch (err) {
    console.error("Error checking application:", err);
  }
};

useEffect(() => {
  if (allJobs.length > 0 && user.email) {
    allJobs.forEach(job => {
      checkIfApplied(job._id);
    });
  }
}, [allJobs, user.email]);




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


  const [filters, setFilters] = useState({
    location: "",
    skill: "",
    startDate: "",
    endDate: "",
    minBudget: "",
    maxBudget: "",
  });

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");


  // For filter toggle animation
  const [filtersVisible, setFiltersVisible] = useState(true);
  const animationValue = useRef(new Animated.Value(1)).current; // 1 means visible, 0 means hidden

  const toggleFilters = () => {
    Animated.timing(animationValue, {
      toValue: filtersVisible ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setFiltersVisible(!filtersVisible);
  };

// Time formatter
const getTimeAgo = (dateString: string) => {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hours ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} days ago`;
};

// Fetch user image by email
const fetchUserImage = async (email: string) => {
  if (userImages[email]) return; // already fetched
  try {
    const res = await fetch(`http://192.168.100.39:3000/api/user-by-email/${email}`);
    if (!res.ok) throw new Error("User not found");
    const data = await res.json();
    const imageUrl =
      data.image && data.image.trim() !== ""
        ? data.image.trim()
        : "https://res.cloudinary.com/dh7kv5dzy/image/upload/v1762757911/Pngtree_user_profile_avatar_13369988_qdlgmg.png";

    setUserImages(prev => ({ ...prev, [email]: imageUrl }));
  } catch (err) {
    setUserImages(prev => ({
      ...prev,
      [email]: "https://res.cloudinary.com/dh7kv5dzy/image/upload/v1762757911/Pngtree_user_profile_avatar_13369988_qdlgmg.png"
    }));
  }
};


// Preload images after fetching jobs
useEffect(() => {
  const preloadImages = async () => {
    const allEmails = [...new Set([...allJobs, ...myJobs].map(j => j.createdBy.email))];
    for (let email of allEmails) {
      await fetchUserImage(email);
    }
  };

  if (allJobs.length > 0 || myJobs.length > 0) {
    preloadImages();
  }
}, [allJobs, myJobs]);




  const filterHeight = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 300], // Adjust based on filters height
  });

  const arrowRotation = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "0deg"], // Rotate arrow up/down
  });

  const clearFilters = () => {
    setFilters({
      location: "",
      skill: "",
      startDate: "",
      endDate: "",
      minBudget: "",
      maxBudget: "",
    });
  };

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

          const resAll = await fetch("http://192.168.100.39:3000/api/alljobs");
const jobsAll = await resAll.json();

setAllJobs(Array.isArray(jobsAll) ? jobsAll : []);


          if (parsedUser.role === "Contractor") {
            const resMine = await fetch(
              `http://192.168.100.39:3000/api/my-jobs-email/${parsedUser.email}`
            );
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

const handleApply = async (job: Job) => {
  try {
    const response = await fetch(`http://192.168.100.39:3000/api/jobs/apply/${job._id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ labourId: user._id, labourEmail: user.email }),
    });

    const data = await response.json();

    if (response.ok) {
      Alert.alert("Success", `You applied for "${job.title}"`);

      // Update local state to reflect the application immediately
      setAllJobs(prev =>
        prev.map(j =>
          j._id === job._id
            ? {
                ...j,
                noOfWorkersApplied: j.noOfWorkersApplied + 1,
                applicants: [
                  ...j.applicants,
                  { laborId: user._id, laborEmail: user.email, appliedAt: new Date().toISOString() },
                ],
              }
            : j
        )
      );

      // Optionally refresh myJobs too if active tab is "myJobs"
      if (activeTab === "myJobs") {
        setMyJobs(prev => [
          ...prev,
          {
            ...job,
            noOfWorkersApplied: job.noOfWorkersApplied + 1,
            applicants: [
              ...job.applicants,
              { laborId: user._id, laborEmail: user.email, appliedAt: new Date().toISOString() },
            ],
          },
        ]);
      }

    } else {
      Alert.alert("Error", data.message);
    }
  } catch (err) {
    console.error(err);
    Alert.alert("Error", "Something went wrong");
  }
};



  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartPicker(Platform.OS === "ios");
    if (selectedDate) {
      handleFilterChange("startDate", selectedDate.toISOString().split("T")[0]);
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndPicker(Platform.OS === "ios");
    if (selectedDate) {
      handleFilterChange("endDate", selectedDate.toISOString().split("T")[0]);
    }
  };

 
const filteredJobs = (
  activeTab === "myJobs"
    ? myJobs
    : allJobs.filter((job) => job.createdBy.email !== user.email)
).filter((job) => {
  const { location, skill, startDate, endDate, minBudget, maxBudget } = filters;

  const matchesSearch =
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.skill.toLowerCase().includes(searchQuery.toLowerCase());

  return (
    matchesSearch &&
    (!location || job.location.toLowerCase().includes(location.toLowerCase())) &&
    (!skill || job.skill.toLowerCase().includes(skill.toLowerCase())) &&
    (!startDate || new Date(job.startDate) >= new Date(startDate)) &&
    (!endDate || new Date(job.endDate) <= new Date(endDate)) &&
    (!minBudget || job.budget >= parseFloat(minBudget)) &&
    (!maxBudget || job.budget <= parseFloat(maxBudget))
  );
});



  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AppBar title="Jobs" />
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#fb923c" />
        </View>
        <BottomTab
          tabs={contractorTabs}
          activeTab="All Jobs"
          userRole="Contractor"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppBar title="Jobs" />

      <View style={styles.tabContainer}>
        {user.role === "Contractor" && (
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "myJobs" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("myJobs")}
          >
            <Text style={styles.tabText}>My Jobs</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "allJobs" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("allJobs")}
        >
          <Text style={styles.tabText}>All Jobs</Text>
        </TouchableOpacity>
      </View>

      {/* Toggle Button */}
      <TouchableOpacity onPress={toggleFilters} style={styles.toggleContainer}>
        <Text style={styles.toggleText}>
          {filtersVisible ? "Hide Filters" : "Show Filters"}
        </Text>
        <Animated.View
          style={[styles.arrow, { transform: [{ rotate: arrowRotation }] }]}
        />
      </TouchableOpacity>

      {/* Filters with animation */}
      <Animated.View style={[styles.filtersContainer, { height: filterHeight, overflow: "hidden" }]}>
        <ScrollView>
            <View style={styles.searchContainer}>
  <TextInput
    style={styles.searchInput}
    placeholder="Search jobs by title or skill..."
    placeholderTextColor="#9ca3af"
    value={searchQuery}
    onChangeText={(text) => setSearchQuery(text)}
  />
</View>
          <View style={styles.row}>
            
            <TextInput
              placeholder="Location"
              style={[styles.filterInput, { flex: 1, marginRight: 5 }]}
              value={filters.location}
              onChangeText={(text) => handleFilterChange("location", text)}
            />
            <TextInput
              placeholder="Skill"
              style={[styles.filterInput, { flex: 1, marginLeft: 5 }]}
              value={filters.skill}
              onChangeText={(text) => handleFilterChange("skill", text)}
            />
          </View>

          <View style={styles.row}>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowStartPicker(true)}
            >
              <Text style={{ color: filters.startDate ? "#111827" : "#9ca3af" }}>
                {filters.startDate || "Start Date"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowEndPicker(true)}
            >
              <Text style={{ color: filters.endDate ? "#111827" : "#9ca3af" }}>
                {filters.endDate || "End Date"}
              </Text>
            </TouchableOpacity>
          </View>

          {showStartPicker && (
            <DateTimePicker
              value={filters.startDate ? new Date(filters.startDate) : new Date()}
              mode="date"
              display="default"
              onChange={handleStartDateChange}
            />
          )}
          {showEndPicker && (
            <DateTimePicker
              value={filters.endDate ? new Date(filters.endDate) : new Date()}
              mode="date"
              display="default"
              onChange={handleEndDateChange}
            />
          )}

          <View style={styles.row}>
            <TextInput
              placeholder="Min Budget"
              style={[styles.filterInput, { flex: 1, marginRight: 5 }]}
              keyboardType="numeric"
              value={filters.minBudget}
              onChangeText={(text) => handleFilterChange("minBudget", text)}
            />
            <TextInput
              placeholder="Max Budget"
              style={[styles.filterInput, { flex: 1, marginLeft: 5 }]}
              keyboardType="numeric"
              value={filters.maxBudget}
              onChangeText={(text) => handleFilterChange("maxBudget", text)}
            />
          </View>

          <View style={styles.rowButtons}>
            <TouchableOpacity style={styles.applyfilterButton}>
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>


      </Animated.View>


      <ScrollView contentContainerStyle={styles.scrollContent}>
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
           <View key={job._id} style={styles.jobCard}>
            
            <Text style={{ color: "#6b7280", fontSize: 12, marginBottom: 5 }}>
  {getTimeAgo(job.createdAt)}
</Text>

              <View
  style={[
    styles.roleTag,
    job.createdBy.role === "Contractor"
      ? styles.contractorTag
      : job.createdBy.role === "Labour"
      ? styles.labourTag
      : styles.industryTag,
  ]}
>
  <Text style={styles.roleTagText}>
    {job.createdBy.role === "Contractor"
      ? "Contractor"
      : job.createdBy.role === "Labour"
      ? "Labour"
      : "Industry"}
  </Text>
</View>

<View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
<Pressable onPress={() => openProfileModal(job.createdBy.email)}>
  <Image
    source={{
      uri: userImages[job.createdBy.email]?.trim() ||
        "https://res.cloudinary.com/dh7kv5dzy/image/upload/v1762757911/Pngtree_user_profile_avatar_13369988_qdlgmg.png"
    }}
    style={{ width: 50, height: 50, borderRadius: 25, marginRight: 10 }}
  />
</Pressable>









  <View>
    <Text style={{ fontWeight: "700", color: "#111827" }}>
      {job.createdBy.firstName} {job.createdBy.lastName}
    </Text>
    <Text style={{ color: "#6b7280", fontSize: 12 }}>
      {job.createdBy.email}
    </Text>
  </View>
</View>

{job.applicants.some(app => app.laborId === user._id) && (
      <Animated.View
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          backgroundColor: "#13582eff",
          paddingVertical: 4,
          paddingHorizontal: 10,
          borderRadius: 12,
          opacity: 0.9,
          transform: [{ scale: 1 }],
          zIndex: 10,
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "700", fontSize: 12 }}>
          Applied
        </Text>
      </Animated.View>
    )}

              <Text style={styles.jobTitle}>{job.title}</Text>
              <Text style={styles.jobText}>{job.description}</Text>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Location:</Text>
                <Text style={styles.infoValue}>{job.location}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Skill:</Text>
                <Text style={styles.infoValue}>{job.skill}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Workers:</Text>
                <Text style={styles.infoValue}>{job.workersRequired}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Budget:</Text>
                <Text style={styles.infoValue}>Rs: {job.budget}</Text>
              </View>
             <View style={styles.infoRow}>
  <Text style={styles.infoLabel}>Duration:</Text>
  <View style={{ flexDirection: "column" }}>
    <Text style={[styles.infoValue, { fontWeight: "700", color: "#fb923c" }]}>
      {Math.max(
        0,
        Math.ceil(
          (new Date(job.endDate).getTime() - new Date(job.startDate).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      )}{" "}
      days
    </Text>
    <Text style={[styles.infoValue, { color: "#6b7280", fontSize: 13 }]}>
      {new Date(job.startDate).toLocaleDateString()} →{" "}
      {new Date(job.endDate).toLocaleDateString()}
    </Text>
  </View>
</View>

              {/* <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Created By:</Text>
                <Text style={styles.infoValue}>
                  {job.createdBy.firstName} {job.createdBy.lastName}
                </Text>
              </View> */}


              {/* <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>User Email:</Text>
                <Text style={styles.infoValue}>
                  {job.createdBy.email}
                </Text>
              </View> */}
{activeTab === "allJobs" && (
  <View style={{ position: "relative", marginBottom: 10 }}>
    {/* Badge at the top-right of the card */}

    <Pressable
  style={({ pressed }) => [
    styles.applyButton,
    pressed && !appliedJobs[job._id] && styles.applyButtonPressed,
    appliedJobs[job._id] && { backgroundColor: "#9ca3af" }, // grey if applied
  ]}
  onPress={() => handleApply(job)}
  disabled={appliedJobs[job._id]} // disable only if applied
>
  <Text style={styles.applyButtonText}>
    {appliedJobs[job._id] ? "Applied" : "Apply"}
  </Text>
</Pressable>

  </View>
)}




            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No jobs found.</Text>
        )}
      </ScrollView>

      <Modal
  transparent
  visible={modalVisible}
  animationType="fade"
  onRequestClose={closeModal}
>
  <Animated.View
    style={{
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
      opacity: opacityAnim,
    }}
  >
    <Animated.View
      style={{
        flex: 1,
        width: "100%",
        backgroundColor: "#fff",
        borderRadius: 0,
        transform: [{ scale: scaleAnim }],
        padding: 15,
      }}
    >
      <Pressable
        onPress={closeModal}
        style={{ position: "absolute", top: 40, right: 20, zIndex: 10 }}
      >
        <Text style={{ fontSize: 22, fontWeight: "700" }}>X</Text>
      </Pressable>

      {/* Profile component inside modal */}
      {selectedEmail && <Profile email={selectedEmail} />}
    </Animated.View>
  </Animated.View>
</Modal>

      <BottomTab
        tabs={contractorTabs}
        activeTab="All Jobs"
        userRole="Contractor"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f9fafb" },
  scrollContent: { padding: 15, paddingBottom: 120 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 25,
    borderRadius: 25,
    backgroundColor: "#e5e7eb",
  },
  activeTab: { backgroundColor: "#fb923c" },
  tabText: { fontWeight: "700", color: "#111827" },

  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  searchContainer: {
  marginHorizontal: 15,
  marginBottom: 10,
},
searchInput: {
  backgroundColor: "#fff",
  borderRadius: 12,
  borderWidth: 1,
  borderColor: "#e5e7eb",
  paddingVertical: 10,
  paddingHorizontal: 15,
  fontSize: 15,
  color: "#111827",
  elevation: 2,
},

  toggleText: {
    fontSize: 16,
    fontWeight: "600",
    marginRight: 6,
    color: "#111827",
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderBottomWidth: 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#111827",
  },

  filtersContainer: {
    backgroundColor: "#fff",
    padding: 12,
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },

  filterInput: {
    backgroundColor: "#f3f4f6",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  dateInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    justifyContent: "center",
    marginHorizontal: 2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 5,
  },
  rowButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  applyButton: {
    flex: 1,
    backgroundColor: "#fb923c",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginRight: 5,
  },
  applyfilterButton: {
    flex: 1,
    backgroundColor: "#4b664eff",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginRight: 5,
  },
  clearButton: {
    flex: 1,
    backgroundColor: "#ef4444",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginLeft: 5,
  },
  applyButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  clearButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },

  jobCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    borderLeftWidth: 5,
    borderLeftColor: "#fb923c",
  },
  jobTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
  jobText: { fontSize: 14, color: "#374151", marginBottom: 8 },
  infoValue: { color: "#374151", marginBottom: 10 },
  emptyText: { fontSize: 14, color: "#6b7280", textAlign: "center" },
  

industryTag: { backgroundColor: "#3b82f6" },

  roleTag: {
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 10,
  },
  contractorTag: { backgroundColor: "#f97316" },
  labourTag: { backgroundColor: "#10b981" },
  roleTagText: { color: "#fff", fontWeight: "700", fontSize: 12 },


  infoRow: { flexDirection: "row", marginBottom: 4 },
  infoLabel: { fontWeight: "600", color: "#4b5563", width: 100 },


  applyButtonPressed: {
    backgroundColor: "#f97316",
    transform: [{ scale: 0.97 }],
    shadowOpacity: 0.5,
  },

});
