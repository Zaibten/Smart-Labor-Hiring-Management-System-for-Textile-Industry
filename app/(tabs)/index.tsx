// app/index.tsx
import React from "react";
import { Text, View, StyleSheet } from "react-native";
import ChatBot from "../components/ChatBot"; // Adjust path if needed

export default function HomePage() {
  return (
    <View style={styles.container}>
      {/* Page content */}
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Home Page</Text>
        <Text style={styles.subtitle}>
          This is your simple React Native App using Expo
        </Text>
      </View>

      {/* Floating Chatbot */}
      <View style={styles.chatbotWrapper}>
        <ChatBot />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold" },
  subtitle: { marginTop: 10, fontSize: 16, color: "#555" },
  chatbotWrapper: { position: "absolute", bottom: 2, right: 2 },
});
