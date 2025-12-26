import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";

import {
    Alert,
    Animated,
    Easing,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export const options = { headerShown: false };
interface ChangePasswordScreenProps {
  onClose: () => void;
}

export default function ChangePasswordScreen({ onClose }: ChangePasswordScreenProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const logoScale = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(logoScale, { toValue: 1, friction: 5, tension: 60, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, easing: Easing.out(Easing.exp), useNativeDriver: true }),
      Animated.timing(slideUp, { toValue: 0, duration: 700, easing: Easing.out(Easing.exp), useNativeDriver: true }),
    ]).start();
  }, []);


  // inside the component
useEffect(() => {
  // Animate logo, fade, and slide
  Animated.parallel([
    Animated.spring(logoScale, { toValue: 1, friction: 5, tension: 60, useNativeDriver: true }),
    Animated.timing(fadeAnim, { toValue: 1, duration: 700, easing: Easing.out(Easing.exp), useNativeDriver: true }),
    Animated.timing(slideUp, { toValue: 0, duration: 700, easing: Easing.out(Easing.exp), useNativeDriver: true }),
  ]).start();

  // Fetch email from local storage
  const fetchEmail = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user"); // assuming you stored a JSON user object
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user.email) setEmail(user.email);
      }
    } catch (err) {
      console.log("Error fetching email from storage:", err);
    }
  };

  fetchEmail();
}, []);

  const handleCheckEmail = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email.");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch("http://172.23.212.221:3000/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setLoading(false);

      if (res.status === 200) {
        setShowModal(true); // Show reset password modal
      } else {
        Alert.alert("Error", data.error || "Email not found");
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
      Alert.alert("Error", "Something went wrong.");
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword) {
      Alert.alert("Error", "Please enter a new password.");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch("http://172.23.212.221:3000/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });
      const data = await res.json();
      setLoading(false);

     if (res.status === 200) {
  setShowModal(false);
  Alert.alert("Success", "Password reset successfully!", [
    { text: "OK", onPress: () => router.replace("/screens/LoginScreen") },
  ]);
} else {
  Alert.alert("Error", data.error || "Failed to reset password.");
}

    } catch (err) {
      console.error(err);
      setLoading(false);
      Alert.alert("Error", "Something went wrong.");
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.container}>

        {/* Close Button at top-right */}
        <TouchableOpacity
          style={{ position: "absolute", top: 40, right: 20, zIndex: 10, backgroundColor: "#ef4444", borderRadius: 18, width: 36, height: 36, justifyContent: "center", alignItems: "center" }}
          onPress={onClose}
        >
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>X</Text>
        </TouchableOpacity>

        {/* Existing logo, form, and modal content */}
        <Animated.View style={{ transform: [{ scale: logoScale }], opacity: fadeAnim, alignItems: "center", marginBottom: 30 }}>
          <Image source={require("../../assets/images/logo.png")} style={styles.logo} resizeMode="contain" />
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideUp }], width: "100%" }}>
          <Text style={styles.title}>Change Password?</Text>
          <Text style={styles.subtitle}>Enter your email to reset your password.</Text>

          <View style={styles.form}>
            <TextInput
  style={[
    styles.input,
    { borderColor: isFocused ? "#fb923c" : "transparent", backgroundColor: "#e5e7eb" }, // lighter bg to indicate disabled
  ]}
  placeholder="Enter your email"
  placeholderTextColor="#aaa"
  keyboardType="email-address"
  autoCapitalize="none"
  value={email}
  onChangeText={setEmail}
  onFocus={() => setIsFocused(true)}
  onBlur={() => setIsFocused(false)}
  editable={false} // make it read-only
/>


            <TouchableOpacity activeOpacity={0.8} style={styles.shadowWrapper} onPress={handleCheckEmail}>
              <LinearGradient colors={["#f97316", "#fb923c"]} style={styles.resetButton}>
                <Text style={styles.resetText}>{loading ? "Checking..." : "Next"}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Reset Password Modal */}
   {/* Reset Password Modal */}
<Modal visible={showModal} transparent animationType="fade">
  <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
    <Animated.View
      style={[
        styles.modalContainer,
        {
          transform: [
            {
              scale: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            },
          ],
        },
      ]}
    >
      {/* Close Button */}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => setShowModal(false)}
      >
        <Text style={{ fontSize: 18, fontWeight: "700", color: "#64748b" }}>×</Text>
      </TouchableOpacity>

      <Text style={styles.modalTitle}>Reset Your Password</Text>
      <Text style={styles.modalSubtitle}>
        Enter a new secure password below to update your account.
      </Text>

     <TextInput
  style={styles.modalInput}
  placeholder="New Password"
  secureTextEntry={!showPassword} // toggle visibility
  value={newPassword}
  onChangeText={setNewPassword}
/>

<TouchableOpacity
  style={styles.eyeButton}
  onPress={() => setShowPassword(!showPassword)}
>
  <Text style={{ fontSize: 18, color: "#64748b" }}>
    {showPassword ? "🙈" : "👁️"}
  </Text>
</TouchableOpacity>
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.shadowWrapper}
        onPress={handleResetPassword}
      >
        <LinearGradient
          colors={["#22c55e", "#16a34a"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.modalResetButton}
        >
          <Text style={styles.resetText}>{loading ? "Updating..." : "Reset Password"}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  </Animated.View>
</Modal>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  eyeButton: {
  position: "absolute",
  right: 35,
  top: 138, // adjust according to modalInput padding
  zIndex: 10,
},

  container: { flex: 1, backgroundColor: "#fff", justifyContent: "center", alignItems: "center", paddingHorizontal: 25 },
  logo: { width: 110, height: 110, marginBottom: 10 },
  title: { fontSize: 28, fontWeight: "700", color: "#0f172a", marginBottom: 10, textAlign: "center" },
  subtitle: { fontSize: 15, color: "#64748b", textAlign: "center", marginBottom: 25 },
  form: { width: "100%", alignItems: "center" },
  input: {
    width: "100%",
    backgroundColor: "#f1f5f9",
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
    color: "#0f172a",
    marginBottom: 20,
    borderWidth: 2,
  },
  shadowWrapper: { width: "100%", borderRadius: 10, elevation: 8 },
  resetButton: { borderRadius: 10, paddingVertical: 15, alignItems: "center", width: "100%" },
  resetText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  backToLogin: { color: "#fb923c", textAlign: "center", marginTop: 22, fontSize: 15, fontWeight: "600" },
  

  modalOverlay: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "rgba(0,0,0,0.6)",
},
modalContainer: {
  width: "85%",
  backgroundColor: "#fff",
  padding: 25,
  borderRadius: 20,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 5 },
  shadowOpacity: 0.3,
  shadowRadius: 15,
  elevation: 20,
},
closeButton: {
  position: "absolute",
  top: 10,
  right: 10,
  zIndex: 10,
  padding: 5,
},
modalTitle: {
  fontSize: 22,
  fontWeight: "700",
  color: "#0f172a",
  textAlign: "center",
  marginBottom: 8,
},
modalSubtitle: {
  fontSize: 14,
  color: "#64748b",
  textAlign: "center",
  marginBottom: 20,
  lineHeight: 20,
},
modalInput: {
  width: "100%",
  backgroundColor: "#f1f5f9",
  padding: 14,
  borderRadius: 12,
  fontSize: 16,
  color: "#0f172a",
  marginBottom: 20,
  borderWidth: 2,
  borderColor: "#e2e8f0",
},
modalResetButton: {
  borderRadius: 12,
  paddingVertical: 15,
  alignItems: "center",
  width: "100%",
},

});
