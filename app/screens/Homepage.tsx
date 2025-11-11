import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AppBar from "../components/AppBar"; // ✅ Import AppBar
import BottomTab from "../components/BottomTab";

export default function Homepage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) setUser(JSON.parse(storedUser));
    };
    fetchUser();
  }, []);

  // 🔹 Logout Function with Confirmation
  const handleLogout = () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert("Logged Out", "You have been successfully logged out.");
              router.replace("/screens/LoginScreen");
            } catch (error) {
              console.error("Logout Error:", error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (!user)
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fb923c" />
        <Text style={{ color: "#fb923c", marginTop: 10, fontWeight: "600" }}>
          Loading Labour Hub...
        </Text>
      </SafeAreaView>
    );

  const nameFromEmail =
    user.email?.split("@")[0].charAt(0).toUpperCase() +
    user.email?.split("@")[0].slice(1);

  // Labour Tabs
  const labourTabs = [
    { label: "Home", icon: "home" },
    { label: "Find Jobs", icon: "briefcase" },
    { label: "Chats", icon: "chatbubble-ellipses" },
    { label: "Settings", icon: "settings" },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ✅ Professional Animated App Bar */}
      <AppBar title={`Welcome, ${nameFromEmail} 👋`} />

      {/* 🔹 Main Content */}
      <View style={styles.container}>
        <Text style={styles.roleText}>Role: {user.role}</Text>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* Chatbot */}
        {/* <View style={styles.chatbotWrapper}>
          <ChatBot />
        </View> */}
      </View>

      {/* 🔹 Labour Bottom Tabs */}
      <View style={styles.tabWrapper}>
        <BottomTab tabs={labourTabs} activeTab="Home" userRole="Labour" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 30,
    backgroundColor: "#fff",
  },
  roleText: {
    marginTop: 20,
    fontSize: 18,
    color: "#fb923c",
    fontWeight: "600",
  },
  logoutButton: {
    marginTop: 30,
    backgroundColor: "#ef4444",
    paddingVertical: 12,
    paddingHorizontal: 35,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.3,
  },
  chatbotWrapper: {
    position: "absolute",
    bottom: 80,
    right: 10,
    zIndex: 5,
  },
  tabWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
});
