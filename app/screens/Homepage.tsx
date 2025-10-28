import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
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

  // 🔹 Logout Function with Confirmation
  const handleLogout = () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.clear(); // ✅ clears ALL storage keys
              Alert.alert("Logged Out", "You have been successfully logged out.");
              router.replace("/screens/LoginScreen"); // ✅ redirect to login
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.header}>Welcome, {nameFromEmail} 👋</Text>
      <Text style={styles.roleText}>Role: {user.role}</Text>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      {/* Chatbot */}
      <View style={styles.chatbotWrapper}>
        <ChatBot />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0f172a",
  },
  roleText: {
    marginTop: 10,
    fontSize: 18,
    color: "#fb923c",
  },
  logoutButton: {
    marginTop: 25,
    backgroundColor: "#ef4444",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  chatbotWrapper: {
    position: "absolute",
    bottom: 2,
    right: 2,
  },
});
