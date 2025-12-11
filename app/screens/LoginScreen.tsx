import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export const options = { headerShown: false };

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

const handleLogin = async () => {
  if (!email || !password) {
    Alert.alert("Validation Error", "Please fill in all fields.");
    return;
  }

  try {
    setLoading(true);

    const res = await fetch("http://192.168.100.39:3000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      Alert.alert("Login Failed", data.error || "Invalid credentials");
      return;
    }

    // Save user info & token in AsyncStorage
    await AsyncStorage.setItem("user", JSON.stringify(data.user));
    await AsyncStorage.setItem("token", data.token);

    Alert.alert("Success", "Login successful!");

    // ✅ Check user role before redirecting
    const role = data.user?.role?.toLowerCase();
    if (role === "contractor") {
      router.replace("/screens/ContractorHomepage");
    } else {
      router.replace("/screens/Homepage");
    }

  } catch (error) {
    setLoading(false);
    console.error(error);
    Alert.alert("Error", "Something went wrong. Please try again later.");
  }
};


  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require("../../assets/images/logo.png")}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.welcomeTitle}>Welcome Back!</Text>
      <Text style={styles.subtitle}>Sign in with your previous account.</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="example@youremail.com"
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholder="Password"
            placeholderTextColor="#aaa"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
          >
            <Text style={styles.eyeIcon}>{showPassword ? "🙈" : "👁️"}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleLogin} disabled={loading}>
          <LinearGradient
            colors={["#f97316", "#fb923c"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.signInButton}
          >
            <Text style={styles.signInText}>
              {loading ? "Signing In..." : "Sign In"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/screens/SignupScreen")}>
          <Text style={styles.createAccount}>Create an Account</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dividerContainer}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.dividerLine} />
      </View>

      <TouchableOpacity onPress={() => router.push("/screens/ForgetPassword")}>
        <Text style={styles.createAccountforget}>
          Click here to reset password
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
  eyeButton: { paddingHorizontal: 8 },
  eyeIcon: { fontSize: 18 },
  signInButton: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },
  signInText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  createAccount: {
    color: "#fb923c",
    textAlign: "center",
    marginTop: 15,
    fontSize: 15,
  },
  createAccountforget: {
    color: "#66625eff",
    textAlign: "center",
    fontSize: 15,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e2e8f0",
  },
  dividerText: {
    marginHorizontal: 10,
    color: "#94a3b8",
    fontWeight: "500",
  },
});
