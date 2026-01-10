import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions, Image, Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import AppBar from "../components/AppBar";
import BottomTab from "../components/BottomTab";
import ChangePasswordScreen from "./ChangePassword";
import UserSkillsScreen from "./Skill";

const { width, height } = Dimensions.get("window");

const labourTabs = [
  { label: "Home", icon: "home" },
  { label: "Find Jobs", icon: "search" },
  { label: "Chats", icon: "chatbubbles" },
  { label: "Settings", icon: "settings" },
];

const contractorTabs = [
  { label: "Home", icon: "home" },
  { label: "Create Jobs", icon: "add-circle" },
  { label: "All Jobs", icon: "list" },
  { label: "Chats", icon: "chatbubbles" },
  { label: "Settings", icon: "settings" },
];

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [skillsVisible, setSkillsVisible] = useState(false);
  const [changePasswordVisible, setChangePasswordVisible] = useState(false);
  const [aboutVisible, setAboutVisible] = useState(false);
  const [faqVisible, setFaqVisible] = useState(false);
  const [userRole, setUserRole] = useState<"Contractor" | "Labour">("Labour");
const [profileImage, setProfileImage] = useState<string | null>(null);
const [email, setEmail] = useState<string | null>(null); // <-- add this
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

useEffect(() => {
  const fetchUser = async () => {
    const storedUser = await AsyncStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      if (parsedUser.role) setUserRole(parsedUser.role);
      if (parsedUser.email) setEmail(parsedUser.email); // <-- ensure email is set
    }
  };
  fetchUser();
}, []);



// Add this function
const uploadProfileImage = async () => {
  if (!profileImage) return;
  if (!email) { // use state instead of user._id
    alert("User email not found. Please log in again.");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("image", {
      uri: profileImage,
      type: "image/jpeg",
      name: "profile.jpg",
    } as any);
    formData.append("email", email); // <-- send email

    const response = await axios.post(
      "http://192.168.100.39:3000/api/update-profile-image",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    if (response.data.user) {
      setUser(response.data.user);
      await AsyncStorage.setItem("user", JSON.stringify(response.data.user));
      alert("Profile image updated successfully!");
    }
  } catch (err) {
    console.log(err);
    alert("Failed to update profile image");
  }
};


const pickImage = async () => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    alert("Permission denied!");
    return;
  }

  let result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
  });

  if (!result.canceled) {
    const selectedUri = result.assets[0].uri;
    setProfileImage(selectedUri); // show image immediately
    await uploadProfileImage(); // upload to Cloudinary & update user
  }
};


  const openModal = (setVisible: any) => {
    setVisible(true);
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.8);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true }),
    ]).start();
  };

  const closeModal = (setVisible: any) => setVisible(false);

  const openSkillsModal = () => openModal(setSkillsVisible);
  const openChangePasswordModal = () => openModal(setChangePasswordVisible);

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.clear();
            router.replace("/screens/LoginScreen");
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (!user)
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fb923c" />
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppBar title="Settings" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Account Section */}
        <Text style={styles.sectionTitle}>Account Settings</Text>
        <TouchableOpacity style={styles.menuItem} onPress={openChangePasswordModal}>
          <Text style={styles.menuLabel}>Change Password</Text>
        </TouchableOpacity>

        <Modal transparent visible={changePasswordVisible} animationType="slide">
          <ChangePasswordScreen onClose={() => setChangePasswordVisible(false)} />
        </Modal>

        <TouchableOpacity style={styles.menuItem} onPress={openSkillsModal}>
          <Text style={styles.menuLabel}>Manage Skills</Text>
        </TouchableOpacity>

<TouchableOpacity style={styles.menuItem} onPress={pickImage}>
  <Text style={styles.menuLabel}>Change Profile Image</Text>
  {profileImage && (
    <Image
      source={{ uri: profileImage }}
      style={{ width: 50, height: 50, borderRadius: 25, marginTop: 10 }}
    />
  )}
</TouchableOpacity>


        <Modal visible={skillsVisible} animationType="slide">
          <UserSkillsScreen />
          <TouchableOpacity
            style={{ position: "absolute", top: 40, right: 20, backgroundColor: "#fb7c3c", padding: 10, borderRadius: 30 }}
            onPress={() => setSkillsVisible(false)}
          >
            <Ionicons name="close" size={26} color="#fff" />
          </TouchableOpacity>
        </Modal>

        {/* Preferences Section */}
        <Text style={styles.sectionTitle}>Preferences</Text>
        {/* <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuLabel}>Notification Settings</Text>
        </TouchableOpacity> */}

        {/* <-- Here is the key update: open UsersScreen on click */}
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/screens/user")}>
          <Text style={styles.menuLabel}>Search Labour & Contractors</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuLabel}>Language Settings</Text>
        </TouchableOpacity>

        {/* Support Section */}
        <Text style={styles.sectionTitle}>Support</Text>
        <TouchableOpacity style={styles.menuItem} onPress={() => openModal(setAboutVisible)}>
          <Text style={styles.menuLabel}>About App</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => openModal(setFaqVisible)}>
          <Text style={styles.menuLabel}>FAQs</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuLabel}>Contact Support</Text>
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.tabWrapper}>
        <BottomTab
          tabs={userRole === "Contractor" ? contractorTabs : labourTabs}
          activeTab="Settings"
          userRole={userRole}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f9f9f9" },
  container: { padding: 20 },
  sectionTitle: { fontSize: 20, fontWeight: "700", color: "#fb7c3c", marginVertical: 10 },
  menuItem: { backgroundColor: "#fff", padding: 18, borderRadius: 12, marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  menuLabel: { fontSize: 16, fontWeight: "600", color: "#111" },
  logoutButton: { marginVertical: 20, backgroundColor: "#ef4444", padding: 16, borderRadius: 12, alignItems: "center" },
  logoutText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  tabWrapper: { position: "absolute", bottom: 0, left: 0, right: 0 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { color: "#fb923c", marginTop: 8, fontSize: 16, fontWeight: "600" },
});
