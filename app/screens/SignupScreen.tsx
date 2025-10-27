import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
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
  const [role, setRole] = useState("Labour");

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#fff" }}
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
          {/* <Text style={styles.appName}>LABOUR HUB</Text> */}
        </View>

        {/* Title */}
        <Text style={styles.welcomeTitle}>Create Account</Text>
        <Text style={styles.subtitle}>
          Join us by creating your account below.
        </Text>

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
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
            >
              <Text style={styles.eyeIcon}>
                {showPassword ? "🙈" : "👁️"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Role Selector */}
          <View style={styles.roleContainer}>
            <TouchableOpacity
              style={[
                styles.roleButton,
                role === "Labour" && styles.activeRoleButton,
              ]}
              onPress={() => setRole("Labour")}
            >
              <Text
                style={[
                  styles.roleText,
                  role === "Labour" && styles.activeRoleText,
                ]}
              >
                Labour
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.roleButton,
                role === "Contractor" && styles.activeRoleButton,
              ]}
              onPress={() => setRole("Contractor")}
            >
              <Text
                style={[
                  styles.roleText,
                  role === "Contractor" && styles.activeRoleText,
                ]}
              >
                Contractor
              </Text>
            </TouchableOpacity>
          </View>

          {/* Signup Button */}
          <TouchableOpacity
            onPress={() => router.replace("/screens/LoginScreen")}
          >
            <LinearGradient
              colors={["#f97316", "#fb923c"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.signInButton}
            >
              <Text style={styles.signInText}>Sign Up</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* OR Divider */}
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

          {/* Back to Login */}
          <TouchableOpacity onPress={() => router.push("/screens/LoginScreen")}>
            <Text style={styles.createAccount}>
              Already have an account? Log in
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
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

  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 15,
  },
  googleIcon: {
    width: 22,
    height: 22,
    marginRight: 8,
  },
  googleText: {
    color: "#0f172a",
    fontSize: 16,
    fontWeight: "500",
  },
  createAccount: {
    color: "#fb923c",
    textAlign: "center",
    marginTop: 5,
    fontSize: 15,
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
