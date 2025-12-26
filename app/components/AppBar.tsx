// import AsyncStorage from "@react-native-async-storage/async-storage";
// import * as Location from 'expo-location';
// import React, { useEffect, useRef, useState } from "react";
// import { Animated, Image, StyleSheet, Text, View } from "react-native";

// interface AppBarProps {
//   title: string;
// }

// interface User {
//   firstName?: string;
//   lastName?: string;
//   role?: string;
//   image?: string;
// }

// const AppBar: React.FC<AppBarProps> = ({ title }) => {
//   const [user, setUser] = useState<User>({
//     image:
//       "https://png.pngtree.com/png-vector/20231019/ourmid/pngtree-user-profile-avatar-png-image_10211467.png",
//   });
//   const [location, setLocation] = useState("Locating...");

//   const slideAnim = useRef(new Animated.Value(-100)).current;
//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const scaleAnim = useRef(new Animated.Value(0.8)).current;

//   useEffect(() => {
//     Animated.parallel([
//       Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
//       Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
//       Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true }),
//     ]).start();

//     // Fetch user from local storage and API
//     const fetchUser = async () => {
//       try {
//         const userData = await AsyncStorage.getItem("user");
//         const localUser = userData ? JSON.parse(userData) : null;
//         if (!localUser?.id) return;

//         const response = await fetch(`http://172.23.212.221:3000/api/user/${localUser.id}`);
//         if (!response.ok) throw new Error("Failed to fetch user");

//         const serverUser = await response.json();
//         setUser({
//           firstName: serverUser.firstName || "",
//           lastName: serverUser.lastName || "",
//           role: serverUser.role || "",
//           image: serverUser.image || "",
//         });
//       } catch (err) {
//         console.error("Error fetching user:", err);
//       }
//     };

//     // Get current location
//     const getLocation = async () => {
//       try {
//         const { status } = await Location.requestForegroundPermissionsAsync();
//         if (status !== 'granted') {
//           setLocation("Permission Denied");
//           return;
//         }

//         const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
//         const { latitude, longitude } = loc.coords;

//         const res = await fetch(
//           `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
//           {
//             headers: {
//               'User-Agent': 'labourshub/1.0 (muzamilkhanofficials@gmail.com)',
//               'Accept-Language': 'en', // Force English
//             },
//           }
//         );
//         const data = await res.json();

//         // Prepare location without country
// const parts = [
//   data.address.suburb || data.address.neighbourhood || data.address.city_district || "",
//   data.address.city || data.address.town || data.address.village || "",
//   data.address.state || "",
//   // data.address.country || "", // Remove this line
// ];
// const display = parts.filter(Boolean).join(", ");
// setLocation(display || "Unknown Location");

//       } catch (err) {
//         console.log(err);
//         setLocation("Location Error");
//       }
//     };

//     fetchUser();
//     getLocation();
//   }, []);

//   return (
//     <Animated.View
//       style={[
//         styles.appBar,
//         { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
//       ]}
//     >
//       {/* User Image */}
//       <Animated.Image
//         source={{
//           uri:
//             user.image && user.image.trim() !== ""
//               ? user.image
//               : "https://res.cloudinary.com/dh7kv5dzy/image/upload/v1762757911/Pngtree_user_profile_avatar_13369988_qdlgmg.png",
//         }}
//         style={[styles.userImage, { transform: [{ scale: scaleAnim }] }]}
//       />

//       {/* Title and user info */}
//       <View style={styles.textContainer}>
//         <Text style={styles.title}>{title}</Text>
//         {user.firstName && (
//           <Text style={styles.userText}>
//             {user.firstName} {user.lastName} • {user.role}
//           </Text>
//         )}
//       </View>

//       {/* Current Location */}
//       <View style={styles.locationWrapper}>
//         <Image
//           source={{ uri: "https://cdn-icons-png.flaticon.com/512/684/684908.png" }}
//           style={styles.locationIcon}
//         />
//         <Text style={styles.locationText}>
//           {location}
//         </Text>
//       </View>
//     </Animated.View>
//   );
// };

// export default AppBar;

// const styles = StyleSheet.create({
//   appBar: {
//     width: "100%",
//     paddingHorizontal: 20,
//     paddingTop: 45,
//     paddingBottom: 12,
//     backgroundColor: "#fb7c3c",
//     flexDirection: "row",
//     alignItems: "center",
//     borderBottomLeftRadius: 18,
//     borderBottomRightRadius: 18,
//     elevation: 6,
//   },
//   userImage: { width: 50, height: 50, borderRadius: 25, marginRight: 15, borderWidth: 1.5, borderColor: "#fff" },
//   textContainer: { flex: 1, marginRight: 10 },
//   title: { color: "#fff", fontSize: 22, fontWeight: "700" },
//   userText: { color: "#fff", fontSize: 15, marginTop: 2, opacity: 0.8 },
//   locationWrapper: {
//     flexDirection: "row",
//     alignItems: "center",
//     maxWidth: 150,      // smaller width to avoid overlap
//   },
//   locationIcon: { width: 18, height: 18, marginRight: 5, tintColor: "#fff" },
//   locationText: {
//     color: "#fff",
//     fontSize: 12,
//     flexShrink: 1,
//     flexWrap: "wrap",
//   },
// });


import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Image, StyleSheet, Text, View } from "react-native";

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
    image:
      "https://png.pngtree.com/png-vector/20231019/ourmid/pngtree-user-profile-avatar-png-image_10211467.png",
  });
  const [location, setLocation] = useState("Locating...");

  const slideAnim = useRef(new Animated.Value(-100)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Animate AppBar appearance
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true }),
    ]).start();

    // Fetch user data
    const fetchUser = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        const localUser = userData ? JSON.parse(userData) : null;
        if (!localUser?.id) return;

        const response = await fetch(`http://172.23.212.221:3000/api/user/${localUser.id}`);
        if (!response.ok) throw new Error("Failed to fetch user");

        const serverUser = await response.json();
        setUser({
          firstName: serverUser.firstName || "",
          lastName: serverUser.lastName || "",
          role: serverUser.role || "",
          image:
            serverUser.image && serverUser.image.trim() !== ""
              ? serverUser.image
              : "https://res.cloudinary.com/dh7kv5dzy/image/upload/v1762757911/Pngtree_user_profile_avatar_13369988_qdlgmg.png",
        });
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };

    // Get user location
    const getLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLocation("Permission Denied");
          return;
        }

        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        const { latitude, longitude } = loc.coords;

        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
          {
            headers: {
              "User-Agent": "labourshub/1.0 (muzamilkhanofficials@gmail.com)",
              "Accept-Language": "en",
            },
          }
        );
        const data = await res.json();

        // Prepare location without country
        const parts = [
          data.address.suburb || data.address.neighbourhood || data.address.city_district || "",
          data.address.city || data.address.town || data.address.village || "",
          data.address.state || "",
        ];
        const display = parts.filter(Boolean).join(", ");
        setLocation(display || "Unknown Location");
      } catch (err) {
        console.error("Location error:", err);
        setLocation("Location Error");
      }
    };

    fetchUser();
    getLocation();
  }, []);

  return (
    <Animated.View
      style={[
        styles.appBar,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      {/* User Image */}
      <Animated.Image
        source={{ uri: user.image }}
        style={[styles.userImage, { transform: [{ scale: scaleAnim }] }]}
      />

      {/* Title and User Info */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {user.firstName && (
          <Text style={styles.userText}>
            {user.firstName} {user.lastName} • {user.role}
          </Text>
        )}
      </View>

      {/* Current Location */}
      <View style={styles.locationWrapper}>
        <Image
          source={{ uri: "https://cdn-icons-png.flaticon.com/512/684/684908.png" }}
          style={styles.locationIcon}
        />
        <Text style={styles.locationText}>{location}</Text>
      </View>
    </Animated.View>
  );
};

export default AppBar;

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
  textContainer: { flex: 1, marginRight: 10 },
  title: { color: "#fff", fontSize: 22, fontWeight: "700" },
  userText: { color: "#fff", fontSize: 15, marginTop: 2, opacity: 0.8 },
  locationWrapper: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: 150,
  },
  locationIcon: { width: 18, height: 18, marginRight: 5, tintColor: "#fff" },
  locationText: { color: "#fff", fontSize: 12, flexShrink: 1, flexWrap: "wrap" },
});
