// File: screens/Homepage.tsx
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
import BottomTab from "../components/BottomTab";
import ChatBot from "../components/ChatBot";

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

  if (!user) return <ActivityIndicator size="large" color="#fb923c" />;

  const nameFromEmail =
    user.email?.split("@")[0].charAt(0).toUpperCase() +
    user.email?.split("@")[0].slice(1);

  // Tabs
  const labourTabs = [
    { label: "Home", icon: "home" },
    { label: "Find Jobs", icon: "briefcase" },
    { label: "Chats", icon: "chatbubble-ellipses" },
    { label: "Settings", icon: "settings" },
  ];

  const contractorTabs = [
    { label: "Home", icon: "home" },
    { label: "Create Jobs", icon: "add-circle" },
    { label: "All Jobs", icon: "list" },
    { label: "Chats", icon: "chatbubbles" },
    { label: "Settings", icon: "settings" },
  ];

  const tabsToShow = user.role === "Contractor" ? contractorTabs : labourTabs;

return (
  <SafeAreaView style={styles.safeArea}>
    {/* Main content */}
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Welcome, {nameFromEmail} 👋</Text>
        <Text style={styles.roleText}>Role: {user.role}</Text>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>

    {/* Chatbot Floating */}
    <View style={styles.chatbotWrapper} pointerEvents="box-none">
      <ChatBot />
    </View>

    {/* Bottom Tab */}
    <View style={styles.tabWrapper}>
      <BottomTab tabs={contractorTabs} activeTab="Home" userRole="Contractor" />
    </View>
  </SafeAreaView>
);

}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start", // ✅ change from "center" to "flex-start"
    paddingTop: 50, // optional padding from top
    backgroundColor: "#fff",
  },
  headerContainer: { alignItems: "center" },
  headerText: { fontSize: 24, fontWeight: "bold", color: "#0f172a" },
  roleText: { marginTop: 8, fontSize: 18, color: "#fb923c" },
  logoutButton: {
    marginTop: 30,
    backgroundColor: "#ef4444",
    paddingVertical: 12,
    paddingHorizontal: 35,
    borderRadius: 10,
    zIndex: 10, // ensure it's on top
  },
  logoutText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  chatbotWrapper: {
    position: "absolute",
    bottom: 80,
    right: 10,
    zIndex: 5, // behind the logout button
  },
  tabWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
});

