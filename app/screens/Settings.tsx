import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Modal,
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
const { width, height } = Dimensions.get("window");

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  const [aboutVisible, setAboutVisible] = useState(false);
  const [faqVisible, setFaqVisible] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;


  // Add this state at the top
const [changePasswordVisible, setChangePasswordVisible] = useState(false);

// Open Change Password modal
const openChangePasswordModal = () => {
  setChangePasswordVisible(true);
  fadeAnim.setValue(0);
  scaleAnim.setValue(0.8);
  Animated.parallel([
    Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true }),
  ]).start();
};


  const contractorTabs = [
    { label: "Home", icon: "home" },
    { label: "Create Jobs", icon: "add-circle" },
    { label: "All Jobs", icon: "list" },
    { label: "Chats", icon: "chatbubbles" },
    { label: "Settings", icon: "settings" },
  ];

  // Logout handler
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
          try {
            await AsyncStorage.clear(); // Clear all local storage
            router.replace("/screens/LoginScreen"); // Redirect to login
          } catch (e) {
            console.log("Error clearing AsyncStorage:", e);
          }
        },
      },
    ],
    { cancelable: true }
  );
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

  useEffect(() => {
    const fetchUser = async () => {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) setUser(JSON.parse(storedUser));
    };
    fetchUser();
  }, []);

  if (!user)
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fb923c" />
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );

  const faqs = [
    { question: "How do I post a labor job?", answer: "Go to the Post Job section and fill the details." },
    { question: "How do I hire contractors?", answer: "Search contractors by rating & industry." },
    { question: "How can I update my profile?", answer: "Go to profile and update details." },
    { question: "Is posting jobs free?", answer: "Yes, it's completely free." },
    { question: "How do I contact support?", answer: "Email support@yourapp.com" },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppBar title="Settings" />
<ScrollView
  style={styles.container}
  showsVerticalScrollIndicator={false}
  contentContainerStyle={{ paddingBottom: 120 }} // <-- add space for bottom tab
>
  {/* Account Section */}
  <Text style={styles.sectionTitle}>Account Settings</Text>
  <TouchableOpacity style={styles.menuItem} onPress={openChangePasswordModal}>
  <Text style={styles.menuLabel}>Change Password</Text>
</TouchableOpacity>


<Modal transparent visible={changePasswordVisible} animationType="slide">
  <ChangePasswordScreen onClose={() => setChangePasswordVisible(false)} />
</Modal>





  {/* Preferences Section */}
  <Text style={styles.sectionTitle}>Preferences</Text>
  <TouchableOpacity style={styles.menuItem}>
    <Text style={styles.menuLabel}>Notification Settings</Text>
  </TouchableOpacity>
  <TouchableOpacity style={styles.menuItem}>
    <Text style={styles.menuLabel}>Theme: Light / Dark</Text>
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


      {/* About Modal */}
      <Modal transparent visible={aboutVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalBox, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
            <Text style={styles.modalTitle}>About Labour Hub</Text>
            <ScrollView>
              <Text style={styles.aboutText}>
                Labour Hub is a platform connecting contractors and labour across Pakistan.
                You can hire, post jobs, chat, and manage work easily. Our goal is to make
                labor hiring seamless, efficient, and trustworthy for all users.
              </Text>
            </ScrollView>
            <TouchableOpacity style={styles.closeBtn} onPress={() => closeModal(setAboutVisible)}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* FAQ Modal */}
      <Modal transparent visible={faqVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalBox, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
            <Text style={styles.modalTitle}>FAQs</Text>
            <ScrollView style={{ marginTop: 10 }}>
              {faqs.map((faq, index) => (
                <View key={index} style={styles.faqItem}>
                  <Text style={styles.question}>{faq.question}</Text>
                  <Text style={styles.answer}>{faq.answer}</Text>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.closeBtn} onPress={() => closeModal(setFaqVisible)}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      <View style={styles.tabWrapper}>
        <BottomTab tabs={contractorTabs} activeTab="Settings" userRole="Contractor" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f9f9f9" },
  fullScreenModal: {
  flex: 1,
  backgroundColor: "#fff",
},
modalHeader: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  padding: 20,
  borderBottomWidth: 1,
  borderColor: "#eee",
},
inputContainer: { marginBottom: 20 },
inputLabel: { fontSize: 14, fontWeight: "600", color: "#555", marginBottom: 5 },
inputField: {
  borderWidth: 1,
  borderColor: "#ddd",
  borderRadius: 10,
  padding: 12,
  fontSize: 16,
  color: "#111",
},
closeModalBtn: {
  backgroundColor: "#ef4444",
  width: 36,
  height: 36,
  borderRadius: 18,
  justifyContent: "center",
  alignItems: "center",
},
closeModalText: {
  color: "#fff",
  fontWeight: "700",
  fontSize: 16,
},

saveBtn: {
  backgroundColor: "#fb7c3c",
  padding: 16,
  borderRadius: 12,
  alignItems: "center",
  marginTop: 10,
},
saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },

  container: { padding: 20 },

  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { color: "#fb923c", marginTop: 8, fontSize: 16, fontWeight: "600" },

  sectionTitle: { fontSize: 20, fontWeight: "700", color: "#fb7c3c", marginVertical: 10 },

  profileCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  profileImage: { width: 80, height: 80, borderRadius: 40, marginBottom: 10 },
  profileName: { fontSize: 18, fontWeight: "700", color: "#111" },
  profileRole: { fontSize: 14, color: "#777", marginTop: 2 },

  menuItem: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  menuLabel: { fontSize: 16, fontWeight: "600", color: "#111" },

  logoutButton: {
    marginVertical: 20,
    backgroundColor: "#ef4444",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  logoutText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  tabWrapper: { position: "absolute", bottom: 0, left: 0, right: 0 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalBox: {
    width: width - 40,
    maxHeight: height - 150,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: { fontSize: 22, fontWeight: "700", textAlign: "center" },
  aboutText: { fontSize: 16, color: "#444", lineHeight: 22, marginTop: 15 },

  faqItem: { marginBottom: 15 },
  question: { fontSize: 16, fontWeight: "700" },
  answer: { fontSize: 14, color: "#444" },

  closeBtn: { marginTop: 10, backgroundColor: "#fb7c3c", paddingVertical: 12, borderRadius: 10 },
  closeBtnText: { color: "#fff", fontWeight: "700", textAlign: "center", fontSize: 16 },
});
