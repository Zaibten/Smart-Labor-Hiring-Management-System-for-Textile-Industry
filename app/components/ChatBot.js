import { Audio } from "expo-av";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ChatBot() {
  const [chatVisible, setChatVisible] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { id: "1", sender: "bot", text: "Hello 👋! I’m your AI assistant." },
  ]);
  const [recording, setRecording] = useState(null);
  const [loading, setLoading] = useState(false);

  const floatAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -8,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: chatVisible ? 1 : 0,
      duration: 400,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [chatVisible]);

  const toggleChat = () => setChatVisible(!chatVisible);

  const handleSend = async (text) => {
    if (!text.trim()) return;

    const userMessage = { id: Date.now().toString(), sender: "user", text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const response = await fetch("https://labourhubserver.vercel.app/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = await response.json();
      const botMessage = { id: Date.now().toString(), sender: "bot", text: data.reply };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error(err);
      const botMessage = {
        id: Date.now().toString(),
        sender: "bot",
        text: "معذرت! کچھ غلط ہو گیا۔",
      };
      setMessages((prev) => [...prev, botMessage]);
    }
  };

const startRecording = async () => {
  try {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== "granted") {
      alert("Microphone permission is required!");
      return;
    }

    const rec = new Audio.Recording();
    await rec.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
    await rec.startAsync();
    setRecording(rec);
  } catch (err) {
    console.error("Recording error:", err);
  }
};

const stopRecording = async () => {
  if (!recording) return;
  try {
    setLoading(true);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecording(null);

    // Convert to FormData
    const formData = new FormData();
    formData.append("file", {
      uri,
      name: "audio.m4a", // use actual recorded extension
      type: "audio/m4a",
    });

    const response = await fetch("https://labourhubserver.vercel.app/transcribe", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    const spokenText = data.text || "";
    if (spokenText) handleSend(spokenText);

    setLoading(false);
  } catch (err) {
    console.error("Transcription error:", err);
    setLoading(false);
  }
};



  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.message,
        item.sender === "user" ? styles.userMessage : styles.botMessage,
      ]}
    >
      <Text style={{ color: item.sender === "user" ? "#fff" : "#333", fontSize: 15 }}>
        {item.text}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <Animated.View
        style={[
          styles.chatContainer,
          {
            transform: [{ translateY: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [350, 0] }) }],
            opacity: slideAnim,
          },
        ]}
      >
        <View style={styles.chatHeader}>
          <Text style={styles.chatTitle}>AI Chatbot 🤖</Text>
          <TouchableOpacity onPress={toggleChat}>
            <Text style={styles.closeBtn}>✕</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesContainer}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#aaa"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => handleSend(input)}
          />
          <TouchableOpacity style={styles.sendButton} onPress={() => handleSend(input)}>
            <Text style={styles.sendText}>➤</Text>
          </TouchableOpacity>

          {/* Speech button */}
          <TouchableOpacity
            style={[styles.sendButton, { marginLeft: 5, backgroundColor: recording ? "red" : "#007AFF" }]}
            onPress={recording ? stopRecording : startRecording}
          >
            <Text style={styles.sendText}>{recording ? "⏹" : "🎤"}</Text>
          </TouchableOpacity>
        </View>
        {loading && <ActivityIndicator size="large" color="#007AFF" />}
      </Animated.View>

      <Animated.View
        style={[styles.floatingButton, { transform: [{ translateY: floatAnim }] }]}
      >
        <TouchableOpacity onPress={toggleChat} activeOpacity={0.8}>
          <Image
            source={require("../../assets/images/chatbot.gif")}
            style={styles.chatbotIcon}
          />
        </TouchableOpacity>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

// Keep your previous styles...

const styles = StyleSheet.create({
  chatContainer: {
    position: "absolute",
    bottom: 110,
    right: 20,
    width: 340,
    height: 520,
    backgroundColor: "#fff",
    borderRadius: 22,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
    overflow: "hidden",
  },
  chatHeader: {
    backgroundColor: "#0078ff",
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chatTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 17,
  },
  closeBtn: { color: "#fff", fontSize: 20 },
  questionsContainer: { maxHeight: 60, marginVertical: 5 },
  questionButton: {
    backgroundColor: "#e9f2ff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  questionText: { color: "#0078ff", fontSize: 13 },
  messagesContainer: { flexGrow: 1, padding: 12 },
  message: { padding: 12, borderRadius: 14, marginBottom: 8, maxWidth: "80%" },
  botMessage: { backgroundColor: "#e9f2ff", alignSelf: "flex-start" },
  userMessage: { backgroundColor: "#0078ff", alignSelf: "flex-end" },
  inputContainer: { flexDirection: "row", alignItems: "center", borderTopWidth: 1, borderColor: "#eee", padding: 10 },
  input: { flex: 1, backgroundColor: "#f5f6fa", borderRadius: 25, paddingHorizontal: 14, color: "#000", height: 45 },
  sendButton: { marginLeft: 10, backgroundColor: "#0078ff", borderRadius: 25, paddingVertical: 10, paddingHorizontal: 14 },
  sendText: { color: "#fff", fontSize: 18 },
  floatingButton: { position: "absolute", bottom: 35, right: 25, shadowColor: "#0078ff", shadowOpacity: 0.5, shadowRadius: 6, elevation: 8 },
  chatbotIcon: { width: 85, height: 85, borderRadius: 42.5 },
});