import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    Easing,
    Image,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export const options = { headerShown: false };

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // Animations
  const logoScale = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 5,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
      Animated.timing(slideUp, {
        toValue: 0,
        duration: 700,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleReset = () => {
    if (!email) {
      alert("Please enter your email address.");
      return;
    }
    alert(`Reset link sent to ${email}`);
    router.replace("/screens/LoginScreen");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        {/* Logo */}
        <Animated.View
          style={{
            transform: [{ scale: logoScale }],
            opacity: fadeAnim,
            alignItems: "center",
            marginBottom: 30,
          }}
        >
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          {/* <Text style={styles.appName}>LABOUR HUB</Text> */}
        </Animated.View>

        {/* Title */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideUp }],
            width: "100%",
          }}
        >
          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            Enter your registered email below and we'll send you a reset link.
          </Text>

          {/* Form */}
          <View style={styles.form}>
            <TextInput
              style={[
                styles.input,
                { borderColor: isFocused ? "#fb923c" : "transparent" },
                isFocused && styles.inputActive,
              ]}
              placeholder="Enter your email"
              placeholderTextColor="#aaa"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />

            {/* Reset Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.shadowWrapper}
              onPress={handleReset}
            >
              <LinearGradient
                colors={["#f97316", "#fb923c"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.resetButton}
              >
                <Text style={styles.resetText}>Send Reset Link</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Back to Login */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push("/screens/LoginScreen")}
            >
              <Text style={styles.backToLogin}>← Back to Login</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 25,
  },
  logo: {
    width: 110,
    height: 110,
    marginBottom: 10,
  },
  appName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a",
    letterSpacing: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 22,
  },
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
  inputActive: {
    shadowColor: "#fb923c",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  shadowWrapper: {
    width: "100%",
    borderRadius: 10,
    shadowColor: "#fb923c",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
  },
  resetButton: {
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
    width: "100%",
  },
  resetText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  backToLogin: {
    color: "#fb923c",
    textAlign: "center",
    marginTop: 22,
    fontSize: 15,
    fontWeight: "600",
  },
});
