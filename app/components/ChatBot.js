import { Audio } from "expo-av";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  FlatList,
  Image,
  Linking,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function ChatBot() {
  const [chatVisible, setChatVisible] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "1",
      sender: "bot",
      text: "السلام علیکم 👋! میں آپ کا AI اسسٹنٹ ہوں۔",
    },
  ]);

  const [recording, setRecording] = useState(null);
  const [loading, setLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState("checking");

  const flatListRef = useRef(null);
  const floatAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const micScale = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // API Configuration - Update this with your server URL
  const API_BASE_URL = "https://labourhubserver.vercel.app";
  const LOCAL_SERVER_URL = "https://labourhubserver.vercel.app"; // For transcription

  useEffect(() => {
    checkServerStatus();
  }, []);

  const checkServerStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chatbot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "test" }),
      });
      if (response.ok) {
        setServerStatus("online");
      } else {
        setServerStatus("offline");
      }
    } catch (err) {
      setServerStatus("offline");
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(micScale, {
          toValue: 1.06,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(micScale, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: false,
        }),
      ]),
    ).start();
  }, []);

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
      ]),
    ).start();
  }, []);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: chatVisible ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

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

    if (serverStatus === "offline") {
      Alert.alert(
        "Server Offline",
        "The server is not responding. Please check your connection.",
        [{ text: "Retry", onPress: () => checkServerStatus() }],
      );
      return;
    }

    const userMessage = { id: Date.now().toString(), sender: "user", text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/chatbot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = await response.json();
      const botMessage = {
        id: Date.now().toString(),
        sender: "bot",
        text: data.reply || data.error || "No response from server",
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error("Chat error:", err);
      const botMessage = {
        id: Date.now().toString(),
        sender: "bot",
        text: `⚠️ Connection error: ${err.message}`,
      };
      setMessages((prev) => [...prev, botMessage]);
      setServerStatus("offline");
    }
  };

  const showTranscriptionGuide = () => {
    Alert.alert(
      "🎤 Voice Transcription Notice",
      "Voice transcription requires a local server with ffmpeg support.\n\n" +
        "📋 To use voice feature:\n" +
        "1️⃣ Run your Node.js server locally\n" +
        "2️⃣ Make sure ffmpeg is installed\n" +
        "3️⃣ Update API_BASE_URL to your local IP\n" +
        "4️⃣ Both devices must be on same WiFi\n\n" +
        "💡 For now, please use text input to chat with the AI assistant.",
      [
        { text: "OK", style: "cancel" },
        { text: "How to Setup?", onPress: () => openSetupGuide() },
      ],
    );
  };

  const openSetupGuide = () => {
    Alert.alert(
      "🔧 Setup Guide",
      "To enable voice transcription:\n\n" +
        "1. Install ffmpeg on your computer:\n" +
        "   • Windows: choco install ffmpeg\n" +
        "   • Mac: brew install ffmpeg\n" +
        "   • Linux: sudo apt install ffmpeg\n\n" +
        "2. Start your Node.js server:\n" +
        "   node index.js\n\n" +
        "3. Find your computer's IP address:\n" +
        "   • Windows: ipconfig\n" +
        "   • Mac/Linux: ifconfig\n\n" +
        "4. Update API_BASE_URL in the code to your IP\n\n" +
        "5. Make sure phone and computer are on same WiFi",
      [
        { text: "Got it", style: "cancel" },
        {
          text: "Need Help?",
          onPress: () => Linking.openURL("https://github.com/your-repo/wiki"),
        },
      ],
    );
  };

  const startRecording = async () => {
    try {
      if (serverStatus === "offline") {
        Alert.alert(
          "Server Offline",
          "Voice feature requires server connection.",
        );
        return;
      }

      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Microphone permission is required!",
        );
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY,
      );
      await rec.startAsync();
      setRecording(rec);
    } catch (err) {
      console.error("Recording error:", err);
      Alert.alert("Error", "Failed to start recording.");
    }
  };

  const stopRecording = async () => {
    try {
      setLoading(true);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      const formData = new FormData();
      formData.append("file", {
        uri,
        name: "audio.m4a",
        type: "audio/m4a",
      });

      const response = await fetch(`${LOCAL_SERVER_URL}/api/transcribe`, {
        method: "POST",
        body: formData,
      });

      if (response.status === 501 || response.status === 500) {
        // Handle server not supporting transcription
        showTranscriptionGuide();
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const spokenText = data.text || "";
      if (spokenText) {
        handleSend(spokenText);
      } else {
        Alert.alert("No Speech Detected", "Please try again.");
      }
      setLoading(false);
    } catch (err) {
      console.error("Transcription error:", err);
      // Don't show error for 501, we already handled it
      if (err.message !== "HTTP 501") {
        showTranscriptionGuide();
      }
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
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      {/* Chat panel */}
      <Animated.View
        style={[
          styles.chatContainer,
          {
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [SCREEN_HEIGHT, 0],
                }),
              },
            ],
            opacity: slideAnim,
          },
        ]}
        pointerEvents={chatVisible ? "auto" : "none"}
      >
        {/* Header */}
        <View style={styles.chatHeader}>
          <View style={styles.headerLeft}>
            <View style={styles.logoWrapper}>
              <Image
                source={require("../../assets/images/logo.png")}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.chatTitle}>Labour Hub AI Assistant</Text>
          </View>
          <TouchableOpacity onPress={toggleChat} style={styles.closeButton}>
            <Text style={styles.closeBtn}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Server Status */}
        {chatVisible && (
          <View style={styles.serverStatus}>
            <View
              style={[
                styles.statusDot,
                serverStatus === "online"
                  ? styles.statusOnline
                  : serverStatus === "checking"
                    ? styles.statusChecking
                    : styles.statusOffline,
              ]}
            />
            <Text style={styles.statusText}>
              {serverStatus === "online"
                ? "Connected"
                : serverStatus === "checking"
                  ? "Connecting..."
                  : "Offline - Check Connection"}
            </Text>
          </View>
        )}

        {/* Voice Feature Notice */}
        {chatVisible && (
          <View style={styles.noticeContainer}>
            <Text style={styles.noticeText}>
              🎤 Voice: Use local server with ffmpeg
            </Text>
          </View>
        )}

        {/* Messages */}
        <View style={styles.messagesWrapper}>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesContainer}
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={true}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            onLayout={() =>
              flatListRef.current?.scrollToEnd({ animated: false })
            }
          />
        </View>

        {/* Input area */}
        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              placeholder="Type your message..."
              placeholderTextColor="#999"
              value={input}
              onChangeText={setInput}
              onSubmitEditing={() => handleSend(input)}
              editable={serverStatus === "online"}
              multiline
              maxLength={500}
            />

            <TouchableOpacity
              style={[
                styles.sendButton,
                (!input.trim() || serverStatus === "offline") &&
                  styles.sendButtonDisabled,
              ]}
              onPress={() => handleSend(input)}
              disabled={!input.trim() || serverStatus === "offline"}
            >
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.micButton, recording && styles.micButtonRecording]}
              onPress={recording ? stopRecording : startRecording}
              activeOpacity={0.9}
              disabled={serverStatus === "offline"}
            >
              <Animated.View
                style={[
                  styles.micHalo,
                  {
                    borderColor: recording ? "#ff4b3b" : "#00bfff",
                    opacity: pulseAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.1, 0.25],
                    }),
                  },
                ]}
              />
              <View style={styles.micIconContainer}>
                <View
                  style={[styles.micIcon, recording && styles.micIconRecording]}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Loading overlay */}
        {loading && (
          <View style={styles.loaderOverlay}>
            <Image
              source={require("../../assets/images/loader.gif")}
              style={styles.loaderGif}
              resizeMode="contain"
            />
            <Text style={styles.loadingText}>Processing audio...</Text>
          </View>
        )}
      </Animated.View>

      {/* Floating Chat Button */}
      <Animated.View
        style={[
          styles.floatingButton,
          {
            transform: [{ translateY: floatAnim }],
            opacity: fadeAnim,
            pointerEvents: chatVisible ? "none" : "auto",
          },
        ]}
      >
        <TouchableOpacity onPress={toggleChat} activeOpacity={0.8}>
          <Image
            source={require("../../assets/images/chatbot.gif")}
            style={styles.chatbotIcon}
          />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 100,
    zIndex: 999,
  },
  chatContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    flexDirection: "column",
    height: SCREEN_HEIGHT * 0.85,
    maxHeight: SCREEN_HEIGHT - 50,
  },
  chatHeader: {
    backgroundColor: "#0078ff",
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  logoWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  logoImage: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
  },
  chatTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    flex: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  closeBtn: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  serverStatus: {
    backgroundColor: "rgba(0,0,0,0.8)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusOnline: {
    backgroundColor: "#4caf50",
  },
  statusOffline: {
    backgroundColor: "#f44336",
  },
  statusChecking: {
    backgroundColor: "#ff9800",
  },
  statusText: {
    color: "#fff",
    fontSize: 11,
  },
  noticeContainer: {
    backgroundColor: "#fff3e0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#ffe0b2",
  },
  noticeText: {
    color: "#e65100",
    fontSize: 11,
    textAlign: "center",
  },
  messagesWrapper: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  messagesContainer: {
    flexGrow: 1,
    padding: 12,
    justifyContent: "flex-end",
  },
  message: {
    padding: 12,
    borderRadius: 18,
    marginBottom: 8,
    maxWidth: "80%",
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    color: "#333",
  },
  botMessage: {
    backgroundColor: "#e9f2ff",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
  },
  userMessage: {
    backgroundColor: "#0078ff",
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  inputContainer: {
    borderTopWidth: 1,
    borderColor: "#e0e0e0",
    padding: 12,
    backgroundColor: "#fff",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 15,
    color: "#333",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: "#0078ff",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 60,
  },
  sendButtonDisabled: {
    backgroundColor: "#ccc",
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  micButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1e1e1e",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    overflow: "visible",
  },
  micButtonRecording: {
    backgroundColor: "#ff4b3b",
  },
  micHalo: {
    position: "absolute",
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
  },
  micIconContainer: {
    width: 20,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  micIcon: {
    width: 16,
    height: 22,
    borderRadius: 8,
    backgroundColor: "#d1d1d1",
    borderWidth: 1,
    borderColor: "#999",
  },
  micIconRecording: {
    backgroundColor: "#ff8a7a",
  },
  loaderOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    borderRadius: 25,
  },
  loaderGif: {
    width: SCREEN_WIDTH * 0.4,
    height: SCREEN_WIDTH * 0.4,
  },
  loadingText: {
    color: "#fff",
    marginTop: 10,
    fontSize: 14,
  },
  floatingButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    shadowColor: "#0078ff",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  chatbotIcon: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
  },
});
