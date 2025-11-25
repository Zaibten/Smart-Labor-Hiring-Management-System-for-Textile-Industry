import { Ionicons } from '@expo/vector-icons'; // Make sure you have expo/vector-icons installed
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface AppBarProps {
  title: string;
}

interface User {
  firstName?: string;
  lastName?: string;
  role?: string;
  image?: string;
}

const AppBar: React.FC<AppBarProps> = ({ title }) => {
  const [user, setUser] = useState<User>({
    image: "https://png.pngtree.com/png-vector/20231019/ourmid/pngtree-user-profile-avatar-png-image_10211467.png",
  });
  const [faqVisible, setFaqVisible] = useState(false);

  // Animation refs
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true }),
    ]).start();

    const fetchUser = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        const localUser = userData ? JSON.parse(userData) : null;
        if (!localUser?.id) return;

        const response = await fetch(`https://labour-server.vercel.app/api/user/${localUser.id}`);
        if (!response.ok) throw new Error("Failed to fetch user");

        const serverUser = await response.json();
        setUser({
          firstName: serverUser.firstName || "",
          lastName: serverUser.lastName || "",
          role: serverUser.role || "",
          image: serverUser.image,
        });
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };

    fetchUser();
  }, []);

  const faqs = [
    {
      question: "How do I post a labor job?",
      answer: "Go to the 'Post Job' section, fill out the required details including job type, location, and budget, and submit.",
    },
    {
      question: "How do I hire contractors?",
      answer: "Search for contractors based on their industry, skills, and ratings, then send them a job request.",
    },
    {
      question: "How can I update my profile?",
      answer: "Click on your profile avatar, select 'Profile', and update your details including name, email, and role.",
    },
    {
      question: "Is there a fee for posting jobs?",
      answer: "No, posting jobs is completely free for all industries and contractors on our platform.",
    },
    {
      question: "How do I contact support?",
      answer: "You can contact support via the 'Help' section or email support@yourapp.com.",
    },
  ];

  return (
    <>
      <Animated.View
        style={[
          styles.appBar,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <Animated.Image
          source={{
            uri:
              user.image && user.image.trim() !== ""
                ? user.image
                : "https://res.cloudinary.com/dh7kv5dzy/image/upload/v1762757911/Pngtree_user_profile_avatar_13369988_qdlgmg.png",
          }}
          style={[styles.userImage, { transform: [{ scale: scaleAnim }] }]}
        />

        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          {user.firstName && (
            <Text style={styles.userText}>
              {user.firstName} {user.lastName} • {user.role}
            </Text>
          )}
        </View>

        {/* FAQ Icon */}
        <TouchableOpacity onPress={() => setFaqVisible(true)} style={styles.faqButton}>
          <Ionicons name="help-circle-outline" size={28} color="#fff" />
        </TouchableOpacity>
      </Animated.View>

      {/* FAQ Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={faqVisible}
        onRequestClose={() => setFaqVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>FAQs</Text>
            <ScrollView style={{ marginTop: 10 }}>
              {faqs.map((faq, index) => (
                <View key={index} style={styles.faqItem}>
                  <Text style={styles.question}>{faq.question}</Text>
                  <Text style={styles.answer}>{faq.answer}</Text>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.closeButton} onPress={() => setFaqVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default AppBar;

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  appBar: {
    width: "100%",
    paddingHorizontal: 20,
    paddingTop: 45,
    paddingBottom: 12,
    backgroundColor: "#fb7c3c",
    flexDirection: "row",
    alignItems: "center",
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  userText: {
    color: "#fff",
    fontSize: 15,
    marginTop: 2,
    opacity: 0.85,
  },
  faqButton: {
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: width - 40,
    maxHeight: height - 100,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
  faqItem: {
    marginBottom: 15,
  },
  question: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  answer: {
    fontSize: 14,
    color: "#555",
  },
  closeButton: {
    marginTop: 10,
    paddingVertical: 10,
    backgroundColor: "#fb7c3c",
    borderRadius: 12,
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 16,
  },
});
