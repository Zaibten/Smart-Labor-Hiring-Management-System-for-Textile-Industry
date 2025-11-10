// components/AppBar.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, StyleSheet, Text, View } from "react-native";

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

  // Animation refs
  const slideAnim = useRef(new Animated.Value(-100)).current; // Slide from top
  const fadeAnim = useRef(new Animated.Value(0)).current; // Fade in
  const scaleAnim = useRef(new Animated.Value(0.8)).current; // Avatar scale

  useEffect(() => {
    // Animate AppBar
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    // Fetch user data
    const fetchUser = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        const localUser = userData ? JSON.parse(userData) : null;
        if (!localUser?.id) return;

        const response = await fetch(`http://192.168.100.37:3000/api/user/${localUser.id}`);
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

  return (
    <Animated.View
      style={[
        styles.appBar,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
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
    </Animated.View>
  );
};

export default AppBar;

const { width } = Dimensions.get("window");

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
});
