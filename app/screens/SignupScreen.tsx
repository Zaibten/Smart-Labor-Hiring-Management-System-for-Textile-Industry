import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export const options = { headerShown: false };

export default function SignupScreen() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"Labour" | "Contractor">("Labour");
  const [loading, setLoading] = useState(false);

  // ✅ Validation Function
  const validateInputs = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!firstName.trim()) {
      Alert.alert("Validation Error", "First name is required.");
      return false;
    }
    if (!lastName.trim()) {
      Alert.alert("Validation Error", "Last name is required.");
      return false;
    }
    if (!/^\d{11}$/.test(phone)) {
      Alert.alert("Validation Error", "Phone number must be exactly 11 digits.");
      return false;
    }
    if (!emailRegex.test(email)) {
      Alert.alert("Validation Error", "Please enter a valid email address.");
      return false;
    }
    if (!password || password.length > 8) {
      Alert.alert("Validation Error", "Password must be max 8 characters.");
      return false;
    }
    return true;
  };

  // ✅ Connect API
  const handleSignup = async () => {
    if (!validateInputs()) return;

    try {
      setLoading(true);

      const res = await fetch("http://192.168.100.37:3000/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          phone,
          email,
          password,
          role,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        Alert.alert("Signup Failed", data.error || data.errors?.join("\n") || "Unknown error");
        return;
      }

      Alert.alert("Success", "Account created successfully!");
      router.replace("/screens/LoginScreen");
    } catch (error) {
      setLoading(false);
      console.error(error);
      Alert.alert("Error", "Something went wrong. Please try again later.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: "#fff" }}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          {/* Title */}
          <Text style={styles.welcomeTitle}>Create Account</Text>
          <Text style={styles.subtitle}>Join us by creating your account below.</Text>

          {/* Form */}
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="First Name"
              placeholderTextColor="#aaa"
              value={firstName}
              onChangeText={setFirstName}
            />
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              placeholderTextColor="#aaa"
              value={lastName}
              onChangeText={setLastName}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              placeholderTextColor="#aaa"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              maxLength={11}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#aaa"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            {/* Password */}
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                placeholder="Password"
                placeholderTextColor="#aaa"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                maxLength={8}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                <Text style={styles.eyeIcon}>{showPassword ? "🙈" : "👁️"}</Text>
              </TouchableOpacity>
            </View>

            {/* Role Selector */}
            <View style={styles.roleContainer}>
              <TouchableOpacity
                style={[styles.roleButton, role === "Labour" && styles.activeRoleButton]}
                onPress={() => setRole("Labour")}
              >
                <Text
                  style={[styles.roleText, role === "Labour" && styles.activeRoleText]}
                >
                  Labour
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.roleButton, role === "Contractor" && styles.activeRoleButton]}
                onPress={() => setRole("Contractor")}
              >
                <Text
                  style={[styles.roleText, role === "Contractor" && styles.activeRoleText]}
                >
                  Contractor
                </Text>
              </TouchableOpacity>
            </View>

            {/* Signup Button */}
            <TouchableOpacity onPress={handleSignup} disabled={loading}>
              <LinearGradient
                colors={["#f97316", "#fb923c"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.signInButton}
              >
                <Text style={styles.signInText}>
                  {loading ? "Creating..." : "Sign Up"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* OR Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Back to Login */}
            <TouchableOpacity onPress={() => router.push("/screens/LoginScreen")}>
              <Text style={styles.createAccount}>
                Already have an account? Log in
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 40,
  },
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  logoImage: {
    width: 100,
    height: 100,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 5,
  },
  subtitle: { color: "#64748b", marginBottom: 25 },
  form: { width: "100%" },
  input: {
    backgroundColor: "#f1f5f9",
    padding: 14,
    borderRadius: 8,
    fontSize: 16,
    color: "#0f172a",
    marginBottom: 12,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    paddingRight: 10,
    marginBottom: 12,
  },
  eyeButton: {
    paddingHorizontal: 8,
  },
  eyeIcon: {
    fontSize: 18,
  },
  roleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 20,
  },
  roleButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginHorizontal: 5,
  },
  activeRoleButton: {
    backgroundColor: "#fb923c",
    borderColor: "#fb923c",
  },
  roleText: {
    color: "#0f172a",
    fontWeight: "500",
    fontSize: 15,
  },
  activeRoleText: {
    color: "#fff",
  },
  signInButton: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },
  signInText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e2e8f0",
  },
  dividerText: {
    marginHorizontal: 10,
    color: "#64748b",
    fontWeight: "500",
  },
  createAccount: {
    color: "#fb923c",
    textAlign: "center",
    marginTop: 5,
    fontSize: 15,
  },
});
