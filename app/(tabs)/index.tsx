import React from "react";
import { StyleSheet, View } from "react-native";
import AppliedJob from "../screens/SplashScreen";

export default function HomePage() {
  return (
    <View style={styles.container}>
      {/* Page content */}
      <AppliedJob />

      {/* Floating Chatbot - Always visible */}
      {/* <View style={styles.chatbotWrapper}>
        <ChatBot />
      </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  chatbotWrapper: {
    position: "absolute",
    bottom: 20,
    right: 20,
    zIndex: 999, // Ensure it stays above other content
  },
});
