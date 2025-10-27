import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
export const options = { headerShown: false };

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Logo Section */}
      <View style={styles.logoContainer}>
        {/* ✅ Use your local logo from assets */}
        <Image
          source={require("../../assets/images/logo.png")}
          style={styles.logoImage}
          resizeMode="contain"
        />
        {/* <Text style={styles.appName}>LABOUR HUB</Text> */}
      </View>

      {/* Welcome Text */}
      <Text style={styles.welcomeTitle}>Welcome Back!</Text>
      <Text style={styles.subtitle}>Sign in with your previous account.</Text>

      {/* Input Fields */}
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="example@youremail"
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* ✅ Password field with show/hide toggle */}
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

        {/* Gradient Button */}
        <TouchableOpacity onPress={() => router.replace("/screens/Homepage")}>
          <LinearGradient
            colors={["#f97316", "#fb923c"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.signInButton}
          >
            <Text style={styles.signInText}>Sign In</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Create Account Link */}
        <TouchableOpacity onPress={() => router.push("/screens/SignupScreen")}>
          <Text style={styles.createAccount}>Create an Account</Text>
        </TouchableOpacity>
      </View>

      {/* Divider */}
      <View style={styles.dividerContainer}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Social Buttons */}
      {/* <View style={styles.socialContainer}>
        <Pressable style={styles.socialButton}>
          <Image
            source={{ uri: "https://cdn-icons-png.flaticon.com/512/281/281764.png" }}
            style={styles.socialIcon}
          />
          <Text style={styles.socialText}>Continue with Google</Text>
        </Pressable>

        <Pressable style={styles.socialButton}>
          <Image
            source={{ uri: "https://cdn-icons-png.flaticon.com/512/15/15476.png" }}
            style={styles.socialIcon}
          />
          <Text style={styles.socialText}>Continue with Apple</Text>
        </Pressable>
      </View> */}

      <TouchableOpacity onPress={() => router.push("/screens/ForgetPassword")}>
          <Text style={styles.createAccountforget}>Click here to reset password</Text>
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
  appName: {
    fontSize: 20,
    color: "#0f172a",
    marginTop: 8,
    fontWeight: "600",
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
  socialContainer: { width: "100%" },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 10,
  },
  socialIcon: { width: 22, height: 22, marginRight: 10 },
  socialText: { fontSize: 15, fontWeight: "500", color: "#0f172a" },
});
