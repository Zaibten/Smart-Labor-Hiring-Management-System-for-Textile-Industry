import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
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
  const animationValue = useRef(new Animated.Value(1)).current;

  const toggleFilters = () => {
    Animated.timing(animationValue, {
      toValue: filtersVisible ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setFiltersVisible(!filtersVisible);
  };

  const filterHeight = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 300],
  });

  const arrowRotation = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "0deg"],
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

  // ✅ Tabs for each role
  const contractorTabs = [
    { label: "Home", icon: "home" },
    { label: "Create Jobs", icon: "add-circle" },
    { label: "All Jobs", icon: "list" },
    { label: "Chats", icon: "chatbubbles" },
    { label: "Settings", icon: "settings" },
  ];

  const labourTabs = [
    { label: "Home", icon: "home" },
    { label: "Find Jobs", icon: "briefcase" },
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
            const resMine = await fetch(
              `http://192.168.100.37:3000/api/my-jobs-email/${parsedUser.email}`
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

  const handleApply = (job: Job) => {
    Alert.alert("Apply Job", `You have applied for "${job.title}"`, [
      { text: "OK" },
    ]);
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
          tabs={user.role === "Labour" ? labourTabs : contractorTabs}
          activeTab={user.role === "Labour" ? "Find Jobs" : "All Jobs"}
          userRole={user.role === "Labour" ? "Labour" : "Contractor"}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppBar title="Jobs" />

      {user.role === "Contractor" && (
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "myJobs" && styles.activeTab]}
            onPress={() => setActiveTab("myJobs")}
          >
            <Text style={styles.tabText}>My Jobs</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "allJobs" && styles.activeTab]}
            onPress={() => setActiveTab("allJobs")}
          >
            <Text style={styles.tabText}>All Jobs</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Toggle Filters */}
      <TouchableOpacity onPress={toggleFilters} style={styles.toggleContainer}>
        <Text style={styles.toggleText}>
          {filtersVisible ? "Hide Filters" : "Show Filters"}
        </Text>
        <Animated.View
          style={[styles.arrow, { transform: [{ rotate: arrowRotation }] }]}
        />
      </TouchableOpacity>

      {/* Filters */}
      <Animated.View
        style={[styles.filtersContainer, { height: filterHeight, overflow: "hidden" }]}
      >
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

      {/* Jobs List */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <View key={job._id} style={styles.jobCard}>
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
                  {job.createdBy.role}
                </Text>
              </View>

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
                    {Math.ceil(
                      (new Date(job.endDate).getTime() - new Date(job.startDate).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )}{" "}
                    days
                  </Text>
                  <Text style={[styles.infoValue, { color: "#6b7280", fontSize: 13 }]}>
                    {new Date(job.startDate).toLocaleDateString()} →{" "}
                    {new Date(job.endDate).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Created By:</Text>
                <Text style={styles.infoValue}>
                  {job.createdBy.firstName} {job.createdBy.lastName}
                </Text>
              </View>

              {activeTab === "allJobs" && (
                <Pressable
                  style={({ pressed }) => [
                    styles.applyButton,
                    pressed && styles.applyButtonPressed,
                  ]}
                  onPress={() => handleApply(job)}
                >
                  <Text style={styles.applyButtonText}>Apply</Text>
                </Pressable>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No jobs found.</Text>
        )}
      </ScrollView>

      {/* ✅ Role-based BottomTab */}
      <BottomTab
        tabs={user.role === "Labour" ? labourTabs : contractorTabs}
        activeTab={user.role === "Labour" ? "Find Jobs" : "All Jobs"}
        userRole={user.role === "Labour" ? "Labour" : "Contractor"}
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
