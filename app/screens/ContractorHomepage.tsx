import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, Image, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { BarChart, ContributionGraph, LineChart, PieChart, ProgressChart } from "react-native-chart-kit";
import AppBar from "../components/AppBar";
import BottomTab from "../components/BottomTab";


const { width } = Dimensions.get("window");

interface Job {
  _id: string;
  title: string;
  workersRequired: number;
  applicants: any[];
  budget: number;
}

export default function ContractorDashboard() {
  const [user, setUser] = useState<any>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);



  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (!storedUser) return;
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        const res = await fetch(`http://192.168.100.39:3000/api/my-jobs-email/${parsedUser.email}`);
        const data = await res.json();
        setJobs(data.length ? data : [{ _id: "default", title: "No Jobs", workersRequired: 0, applicants: [], budget: 0 }]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

// inside your component
if (loading) return (
  <SafeAreaView style={styles.loadingContainer}>
    <View style={styles.loaderBox}>
      <ActivityIndicator size="large" color="#fb923c" />
      <Text style={styles.loadingText}>Loading Dashboard...</Text>
    </View>
  </SafeAreaView>
);

  const totalApplicants = jobs.reduce((acc, job) => acc + (job.applicants?.length || 0), 0);
  const maxApplicants = Math.max(...jobs.map(j => j.applicants?.length || 1));

  // --- Chart Data ---
  const barData = {
    labels: jobs.map(j => j.title),
    datasets: [{ data: jobs.map(j => j.applicants?.length || 0) }]
  };

  const stackedBarData = {
    labels: jobs.map(j => j.title),
    datasets: [
      { data: jobs.map(j => j.applicants?.length || 0), color: () => `rgba(251, 146, 60, 1)` },
      { data: jobs.map(j => j.workersRequired || 0), color: () => `rgba(60, 179, 113, 1)` }
    ]
  };

  const lineData = {
    labels: jobs.map(j => j.title),
    datasets: [{ data: jobs.map(j => j.applicants?.length || 0), strokeWidth: 2, color: () => `rgba(251, 146, 60, 1)` }]
  };

  const pieData = jobs.map(j => ({
    name: j.title,
    population: j.applicants?.length || 1,
    color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
    legendFontColor: "#7F7F7F",
    legendFontSize: 12
  }));

  const progressData = {
    labels: jobs.map(j => j.title),
    data: jobs.map(j => Math.min((j.applicants?.length || 0) / maxApplicants, 1))
  };

  // NEW CHART: Contribution Graph (e.g., job activity over time)
  const contributionData = jobs.map((j, idx) => ({
    date: new Date(Date.now() - idx * 86400000).toISOString().split("T")[0],
    count: j.applicants?.length || 0
  }));

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ------------------ AppBar ------------------ */}
      <AppBar title={`Welcome, ${user.firstName} 👷‍♂️`} />

      {/* ------------------ Scrollable Content ------------------ */}
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        {/* ------------------ User Info Card ------------------ */}
        <View style={styles.userCard}>
          <Image
  source={{
    uri:
      user?.image && user.image.trim() !== ""
        ? user.image
        : "https://res.cloudinary.com/dh7kv5dzy/image/upload/v1762757911/Pngtree_user_profile_avatar_13369988_qdlgmg.png",
  }}
  style={styles.userImage}
/>

          <View style={{ flex: 1, marginLeft: 15 }}>
            <Text style={styles.userName}>{user.firstName} {user.lastName}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <Text style={styles.userRole}>{user.role}</Text>
          </View>
        </View>

{/* ------------------ Contractor Details ------------------ */}
{user?.role === "Contractor" && (
  <View style={styles.contractorDetailsCard}>
    <Text style={styles.sectionTitle}>Contractor Details</Text>

    <View style={styles.contractorStatsRow}>
      <View style={styles.contractorStat}>
        <Text style={styles.contractorStatNumber}>{jobs.length}</Text>
        <Text style={styles.contractorStatLabel}>Jobs Posted</Text>
      </View>
      <View style={styles.contractorStat}>
        <Text style={styles.contractorStatNumber}>{totalApplicants}</Text>
        <Text style={styles.contractorStatLabel}>Total Applicants</Text>
      </View>
      <View style={styles.contractorStat}>
        <Text style={styles.contractorStatNumber}>{Math.max(...jobs.map(j => j.workersRequired || 0))}</Text>
        <Text style={styles.contractorStatLabel}>Max Workers Needed</Text>
      </View>
    </View>

    {/* Latest 3 Jobs */}
    <Text style={[styles.sectionTitle, { marginTop: 15 }]}>Latest Jobs Posted</Text>
    {jobs.slice(0, 3).map(job => (
      <View key={job._id} style={styles.latestJobCard}>
        <Text style={styles.latestJobTitle}>{job.title}</Text>
        <Text style={styles.latestJobInfo}>
          Workers Required: {job.workersRequired} | Budget: ${job.budget}
        </Text>
        <Text style={styles.latestJobInfo}>Applicants: {job.applicants?.length || 0}</Text>
      </View>
    ))}
  </View>
)}

        {/* ------------------ Stats Cards ------------------ */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{jobs.length}</Text>
            <Text style={styles.statLabel}>Jobs Posted</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalApplicants}</Text>
            <Text style={styles.statLabel}>Total Applicants</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{Math.max(...jobs.map(j => j.workersRequired || 0))}</Text>
            <Text style={styles.statLabel}>Max Workers Needed</Text>
          </View>
        </View>

        {/* ------------------ Bar Chart ------------------ */}
        <View style={styles.chartWrapperFull}>
          <Text style={styles.chartTitle}>Applicants per Job</Text>
          <BarChart
            data={barData}
            width={width - 40}
            height={220}
            chartConfig={chartConfig}
            verticalLabelRotation={30}
            yAxisLabel=""
  yAxisSuffix=""
            fromZero
            showValuesOnTopOfBars
            style={styles.chartStyle}
          />
        </View>

        {/* ------------------ Stacked Bar Chart ------------------ */}
        <View style={styles.chartWrapperFull}>
          <Text style={styles.chartTitle}>Applicants vs Workers</Text>
          <BarChart
            data={stackedBarData}
            width={width - 40}
            height={220}
            chartConfig={chartConfig}
            verticalLabelRotation={30}
            yAxisLabel=""
  yAxisSuffix=""
            fromZero
            showValuesOnTopOfBars
            style={styles.chartStyle}
          />
        </View>

        {/* ------------------ Line Chart ------------------ */}
        <View style={styles.chartWrapperFull}>
          <Text style={styles.chartTitle}>Applicants Trend</Text>
          <LineChart
            data={lineData}
            width={width - 40}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chartStyle}
            withDots
            withShadow
          />
        </View>

        {/* ------------------ Pie Chart ------------------ */}
        <View style={styles.chartWrapperFull}>
          <Text style={styles.chartTitle}>Job Distribution</Text>
          <PieChart
            data={pieData}
            width={width - 40}
            height={220}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </View>

        {/* ------------------ Progress Chart ------------------ */}
        <View style={styles.chartWrapperFull}>
          <Text style={styles.chartTitle}>Applicants Ratio</Text>
          <ProgressChart
            data={progressData}
            width={width - 40}
            height={220}
            strokeWidth={16}
            radius={32}
            chartConfig={chartConfig}
            hideLegend={false}
          />
        </View>

        {/* ------------------ Contribution Graph (NEW) ------------------ */}
        <View style={styles.chartWrapperFull}>
          <Text style={styles.chartTitle}>Job Activity Over Time</Text>
          <ContributionGraph
  values={contributionData}
  endDate={new Date()}
  numDays={30}
  width={width - 40}
  height={220}
  chartConfig={chartConfig}
/>

        </View>

      </ScrollView>

      {/* ------------------ Bottom Tab ------------------ */}
      <BottomTab 
        tabs={[
          { label: "Home", icon: "home" },
          { label: "Create Jobs", icon: "add-circle" },
          { label: "All Jobs", icon: "list" },
          { label: "Chats", icon: "chatbubbles" },
          { label: "Settings", icon: "settings" }
        ]}
        activeTab="Home"
        userRole="Contractor"
      />
    </SafeAreaView>
  );
}

const chartConfig = {
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#f5f6fa",
  color: (opacity = 1) => `rgba(251, 146, 60, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.6,
  useShadowColorFromDataset: false,
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f0f4f8" },
loadingContainer: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "#ffffff",
},

loaderBox: {
  width: 160,
  height: 160,
  borderRadius: 24,
  backgroundColor: "#fff",
  justifyContent: "center",
  alignItems: "center",
  shadowColor: "#fb923c",
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.35,
  shadowRadius: 12,
  elevation: 12,
  transform: [{ scale: 1 }],
  // Animate scaling for subtle bounce effect
},

loadingText: {
  marginTop: 12,
  fontSize: 16,
  fontWeight: "700",
  color: "#fb923c",
  textAlign: "center",
},

// Optional: keyframe animation for bounce (React Native Animated alternative)


  container: { paddingVertical: 20, paddingHorizontal: 20 },

  

  // --- User Card ---
  userCard: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 18,
    marginBottom: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 6,
    transform: [{ translateY: 0 }],
  },
  userImage: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    borderWidth: 3,
    borderColor: "#fb923c",
  },
  userName: { fontSize: 22, fontWeight: "700", color: "#111827" },
  userEmail: { fontSize: 14, color: "#6b7280", marginTop: 4 },
  userRole: { fontSize: 14, color: "#0a66c2", marginTop: 2, fontWeight: "600" },

  // --- Contractor Details ---
  contractorDetailsCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginVertical: 12,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 10,
  },
  contractorStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  contractorStat: { alignItems: "center", flex: 1 },
  contractorStatNumber: { fontSize: 20, fontWeight: "700", color: "#fb923c" },
  contractorStatLabel: { fontSize: 12, color: "#6b7280", marginTop: 4 },

  latestJobCard: {
    backgroundColor: "#f9f9f9",
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  latestJobTitle: { fontSize: 16, fontWeight: "600", color: "#111827" },
  latestJobInfo: { fontSize: 13, color: "#555", marginTop: 3 },

  // --- Stats Cards ---
  statsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 25 },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    marginHorizontal: 5,
    padding: 22,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    transform: [{ scale: 1 }],
  },
  statNumber: { fontSize: 28, fontWeight: "700", color: "#fb923c" },
  statLabel: { fontSize: 14, color: "#6b7280", marginTop: 6 },

  // --- Charts ---
  chartWrapperFull: {
    width: width - 40,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    marginBottom: 25,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 12,
    elevation: 5,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    color: "#111827",
    textAlign: "center",
  },
  chartStyle: {
    borderRadius: 16,
    backgroundColor: "#f9fafb",
    padding: 8,
  },

  // --- Animations hint ---
  animatedCard: {
    transform: [{ scale: 1 }],
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
});
