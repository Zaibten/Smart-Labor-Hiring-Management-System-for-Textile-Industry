import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
    Animated,
    Easing,
    StyleSheet,
    Text,
    View
} from "react-native";

export default function SplashScreen() {
  const router = useRouter();

  // Animated values
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(50)).current; // for slide up
  const subtitleOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Sequence animation for logo and text
    Animated.sequence([
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(titleAnim, {
          toValue: 0,
          duration: 800,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
        Animated.timing(subtitleOpacity, {
          toValue: 1,
          duration: 1000,
          delay: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Redirect to login after 3 seconds
    const timer = setTimeout(() => {
      router.replace("/screens/LoginScreen");
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* Animated Logo */}
      <Animated.Image
        source={require("../../assets/images/logo.png")}
        style={[
          styles.logo,
          {
            transform: [
              {
                scale: scaleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.2, 1.05],
                }),
              },
            ],
            opacity: opacityAnim,
          },
        ]}
        resizeMode="contain"
      />

      {/* Animated Title */}
      <Animated.Text
        style={[
          styles.title,
          {
            opacity: opacityAnim,
            transform: [{ translateY: titleAnim }],
          },
        ]}
      >
        Welcome to <Text style={{ color: "#f97316" }}>SignBridge</Text>
      </Animated.Text>

      {/* Animated Subtitle */}
      <Animated.Text
        style={[
          styles.subtitle,
          {
            opacity: subtitleOpacity,
            transform: [{ translateY: subtitleOpacity.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0],
            }) }],
          },
        ]}
      >
        Connecting Labour & Contractors
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 130,
    height: 130,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    color: "#1E293B",
    fontWeight: "700",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#64748B",
    marginTop: 10,
    textAlign: "center",
    letterSpacing: 0.3,
  },
});
