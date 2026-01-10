import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    FlatList,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import AppBar from "../components/AppBar";
import BottomTab from "../components/BottomTab";

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  image: string;
  skills: string[];
  role: "Labour" | "Contractor";
  badge: string;
}

interface ChatMessage {
  senderEmail: string;
  receiverEmail: string;
  message: string;
  timestamp: string;
}

interface Review {
  reviewerEmail: string;
  rating: number;
  feedback?: string;
  createdAt: string;
}

interface Profile {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    image: string;
    createdAt: string;
    averageRating?: number;
    totalReviews?: number;
  };
  reviews: Review[];
  stats: {
    totalJobsPosted: number;
    totalJobsApplied: number;
    totalApplicantsOnJobs: number;
  };
}

const API_URL = "http://192.168.100.39:3000/api/users";

export default function UsersScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [nameSearch, setNameSearch] = useState("");
  const [skillSearch, setSkillSearch] = useState("");
const [userProfiles, setUserProfiles] = useState<{ [email: string]: Profile }>({});

  const [chatModalVisible, setChatModalVisible] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentReceiver, setCurrentReceiver] = useState("");
  const [newMessage, setNewMessage] = useState("");

  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [profileData, setProfileData] = useState<Profile | null>(null);
  const [userEmail, setUserEmail] = useState("");

  const [userRole, setUserRole] = useState<"Contractor" | "Labour">("Labour");

  const [reviewModalVisible, setReviewModalVisible] = useState(false);
const [reviewRating, setReviewRating] = useState<number>(0);
const [reviewFeedback, setReviewFeedback] = useState("");
const [reviewTargetEmail, setReviewTargetEmail] = useState(""); // user being reviewed
const openReviewModal = (email: string) => {
  setReviewTargetEmail(email);
  setReviewModalVisible(true);
};

const submitReview = async () => {
  if (!reviewRating) {
    alert("Please select a rating");
    return;
  }

  try {
    const res = await axios.post(`http://192.168.100.39:3000/api/users/${reviewTargetEmail}/review`, {
      reviewerEmail: userEmail, // logged-in user
      rating: reviewRating,
      feedback: reviewFeedback,
    });

    alert("Review submitted successfully!");
    setReviewModalVisible(false);
    setReviewRating(0);
    setReviewFeedback("");
  } catch (err) {
    console.error(err);
    alert("Failed to submit review");
  }
};


//   const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);


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

  // Fetch logged-in user email & role
  useEffect(() => {
    const fetchUser = async () => {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUserEmail(parsedUser.email);
        if (parsedUser.role) setUserRole(parsedUser.role);
      }
    };
    fetchUser();
  }, []);

  // Fetch users
  const fetchUsers = async (name = "", skill = "") => {
    try {
      setLoading(true);
      const params: any = {};
      if (name.trim()) params.q = name;
      if (skill.trim()) params.skill = skill;

      const res = await axios.get(API_URL, { params });
      setUsers(res.data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search effect
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      fetchUsers(nameSearch, skillSearch);
    }, 500); // 500ms delay after user stops typing
  }, [nameSearch, skillSearch]);

  const handleRefresh = () => {
    setNameSearch("");
    setSkillSearch("");
    fetchUsers();
  };

  // Open chat
  const openChat = async (receiverEmail: string) => {
    setCurrentReceiver(receiverEmail);
    setChatModalVisible(true);

    try {
      const res = await axios.get(
        `http://192.168.100.39:3000/api/chat/${userEmail}/${receiverEmail}`
      );
      setChatMessages(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      const res = await axios.post(
        "http://192.168.100.39:3000/api/chat/send",
        {
          senderEmail: userEmail,
          receiverEmail: currentReceiver,
          message: newMessage,
        }
      );
      setChatMessages((prev) => [...prev, res.data]);
      setNewMessage("");
    } catch (err) {
      console.error(err);
    }
  };

  // Open profile
const openProfile = async (email: string) => {
  try {
    const res = await axios.get(`http://192.168.100.39:3000/api/profile/${email}`);
    setUserProfiles(prev => ({ ...prev, [email]: res.data }));
    setProfileModalVisible(true);
    setProfileData(res.data); // optional, if you want modal to work
  } catch (err) {
    console.error(err);
  }
};


const renderUser = ({ item }: { item: User }) => {
  const profile = userProfiles[item.email]; // get profile for this user

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={() => openProfile(item.email)}>
        <Image source={{ uri: item.image }} style={styles.avatar} />
      </TouchableOpacity>

      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.name}>{item.name}</Text>

        <Text
          style={[
            styles.badge,
            { backgroundColor: item.role === "Contractor" ? "#2563eb" : "#16a34a" },
          ]}
        >
          {item.badge}
        </Text>

        <Text style={styles.skills}>
          {item.skills.length ? item.skills.join(", ") : "No skills added"}
        </Text>

        {/* Chat Button */}
        <TouchableOpacity
          onPress={() => openChat(item.email)}
          style={styles.chatBtn}
        >
          <Text style={{ color: "#fff" }}>💬 Chat</Text>
        </TouchableOpacity>

        {/* ⭐ User rating */}
        <Text style={{ textAlign: "center", marginVertical: 6 }}>
          ⭐ {profile?.user?.averageRating || 0} / 5  
          ({profile?.user?.totalReviews || 0} reviews)
        </Text>

        {/* ⭐ Review Button */}
        {item.email !== userEmail && (
          <TouchableOpacity
            onPress={() => openReviewModal(item.email)}
            style={styles.reviewBtn}
          >
            <Text style={{ color: "#16a34a", fontWeight: "bold" }}>
              ⭐ Submit Review
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};



  if (loading)
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fb923c" />
      </View>
    );

  return (
    <View style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
      <AppBar title="Users" />
      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        renderItem={renderUser}
        contentContainerStyle={{ paddingBottom: 80, paddingHorizontal: 16 }}
        ListHeaderComponent={
          <>
            <TextInput
              placeholder="Search by name"
              value={nameSearch}
              onChangeText={setNameSearch}
              style={styles.search}
            />
            <TextInput
              placeholder="Search by skill"
              value={skillSearch}
              onChangeText={setSkillSearch}
              style={[styles.search, { marginTop: 8 }]}
            />
            <TouchableOpacity
              onPress={handleRefresh}
              style={{ alignSelf: "flex-end", marginVertical: 8 }}
            >
              <Text style={{ fontSize: 18 }}>⟳</Text>
            </TouchableOpacity>
          </>
        }
      />

      {/* Chat Modal */}
      <Modal visible={chatModalVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalBg}
          onPress={() => setChatModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
              Chat with {currentReceiver}
            </Text>
            <ScrollView style={{ flex: 1, marginBottom: 10 }}>
              {chatMessages.map((msg, i) => (
                <View
                  key={i}
                  style={{
                    alignSelf: msg.senderEmail === userEmail ? "flex-end" : "flex-start",
                    marginBottom: 5,
                  }}
                >
                  <View
                    style={[
                      styles.chatBubble,
                      {
                        backgroundColor:
                          msg.senderEmail === userEmail ? "#0a66c2" : "#e0e0e0",
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: msg.senderEmail === userEmail ? "#fff" : "#000",
                      }}
                    >
                      {msg.message}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 10, color: "#555" }}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </Text>
                </View>
              ))}
            </ScrollView>
            <View style={{ flexDirection: "row", gap: 5 }}>
              <TextInput
                value={newMessage}
                onChangeText={setNewMessage}
                placeholder="Type a message..."
                style={styles.messageInput}
              />
              <TouchableOpacity onPress={sendMessage} style={styles.sendBtn}>
                <Text style={{ color: "#fff" }}>Send</Text>
              </TouchableOpacity>


            </View>
          </View>
        </TouchableOpacity>



      </Modal>


{/* Review Modal */}
<Modal visible={reviewModalVisible} transparent animationType="fade">
  <TouchableOpacity
    style={styles.modalBg}
    activeOpacity={1}
    onPress={() => setReviewModalVisible(false)}
  >
    <Animated.View
      style={[
        styles.modalContent,
        {
          transform: [{ scale: 1 }],
        },
      ]}
    >
      <Text style={{ fontWeight: "bold", fontSize: 18, textAlign: "center" }}>
        Leave a Review
      </Text>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          marginVertical: 10,
        }}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => setReviewRating(star)}>
            <Text
              style={{
                fontSize: 30,
                color: star <= reviewRating ? "#facc15" : "#ccc",
              }}
            >
              ★
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        placeholder="Write your feedback..."
        value={reviewFeedback}
        onChangeText={setReviewFeedback}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 8,
          padding: 10,
          height: 100,
        }}
        multiline
      />

      <TouchableOpacity
        onPress={submitReview}
        style={{
          backgroundColor: "#2563eb",
          padding: 12,
          borderRadius: 8,
          marginTop: 10,
        }}
      >
        <Text
          style={{
            color: "#fff",
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          Submit
        </Text>
      </TouchableOpacity>
    </Animated.View>
  </TouchableOpacity>
</Modal>

{/* Profile Modal */}
<Modal visible={profileModalVisible} transparent animationType="fade">
  <TouchableOpacity
    style={styles.modalBg}
    activeOpacity={1}
    onPress={() => setProfileModalVisible(false)}
  >
    {profileData ? (
      <ScrollView
        style={[styles.modalContent, { maxHeight: "80%" }]}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <Text style={{ fontWeight: "bold", fontSize: 18, textAlign: "center" }}>
          {profileData.user.firstName} {profileData.user.lastName}
        </Text>
        <Image
          source={{ uri: profileData.user.image }}
          style={{ width: 100, height: 100, borderRadius: 50, alignSelf: "center", marginVertical: 10 }}
        />
        <Text>
          <Text style={{ fontWeight: "bold" }}>Email:</Text> {profileData.user.email}
        </Text>
        <Text>
          <Text style={{ fontWeight: "bold" }}>Role:</Text> {profileData.user.role}
        </Text>
        <Text>
          <Text style={{ fontWeight: "bold" }}>Joined:</Text>{" "}
          {new Date(profileData.user.createdAt).toLocaleDateString()}
        </Text>

        <View style={{ borderBottomWidth: 1, borderColor: "#ccc", marginVertical: 5 }} />

        <Text>
          <Text style={{ fontWeight: "bold" }}>Total Jobs Posted:</Text>{" "}
          {profileData.stats.totalJobsPosted}
        </Text>
        <Text>
          <Text style={{ fontWeight: "bold" }}>Total Jobs Applied:</Text>{" "}
          {profileData.stats.totalJobsApplied}
        </Text>
        <Text>
          <Text style={{ fontWeight: "bold" }}>Total Applicants On Jobs:</Text>{" "}
          {profileData.stats.totalApplicantsOnJobs}
        </Text>

        <View style={{ borderBottomWidth: 1, borderColor: "#ccc", marginVertical: 10 }} />

        {/* ⭐ Average Rating */}
        <Text style={{ fontWeight: "bold", marginBottom: 6 }}>
          ⭐ {profileData.user.averageRating || 0} / 5 ({profileData.user.totalReviews || 0} reviews)
        </Text>

        {/* Reviews */}
        {profileData.reviews?.length === 0 ? (
          <Text style={{ color: "#777" }}>No reviews yet</Text>
        ) : (
          profileData.reviews.map((review, index) => (
            <View
              key={index}
              style={{
                backgroundColor: "#f9fafb",
                padding: 10,
                borderRadius: 8,
                marginBottom: 8,
              }}
            >
              <Text style={{ fontWeight: "bold" }}>{review.reviewerEmail}</Text>

              <Text style={{ color: "#facc15", fontSize: 16 }}>
                {"★".repeat(review.rating)}
                {"☆".repeat(5 - review.rating)}
              </Text>

              {review.feedback ? (
                <Text style={{ color: "#555", marginTop: 4 }}>{review.feedback}</Text>
              ) : null}

              <Text style={{ fontSize: 10, color: "#999", marginTop: 4 }}>
                {new Date(review.createdAt).toLocaleDateString()}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    ) : null}
</TouchableOpacity>
</Modal>


{/* Reviews Section */}
{/* <View style={{ marginTop: 10 }}>
  <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 6 }}>
    Reviews
  </Text>

  {profileData?.reviews?.length === 0 ? (
    <Text style={{ color: "#777" }}>No reviews yet</Text>
  ) : (
    <ScrollView style={{ maxHeight: 200 }}>
      {profileData?.reviews?.map((review, index) => (
        <View
          key={index}
          style={{
            backgroundColor: "#f9fafb",
            padding: 10,
            borderRadius: 8,
            marginBottom: 8,
          }}
        >
          <Text style={{ fontWeight: "bold" }}>
            {review.reviewerEmail}
          </Text>

          <Text style={{ color: "#facc15", fontSize: 16 }}>
            {"★".repeat(review.rating)}
            {"☆".repeat(5 - review.rating)}
          </Text>

          {review.feedback ? (
            <Text style={{ color: "#555", marginTop: 4 }}>
              {review.feedback}
            </Text>
          ) : null}

          <Text style={{ fontSize: 10, color: "#999", marginTop: 4 }}>
            {new Date(review.createdAt).toLocaleDateString()}
          </Text>
        </View>
      ))}
    </ScrollView>
  )}
</View> */}

      

      <View style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
        <BottomTab
          tabs={userRole === "Contractor" ? contractorTabs : labourTabs}
          activeTab=""
          userRole={userRole}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  search: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 10, marginVertical: 5 },
  card: {
    flexDirection: "row",
    gap: 12,
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  avatar: { width: 60, height: 60, borderRadius: 30 },
  name: { fontSize: 16, fontWeight: "bold" },
  badge: {
    color: "#fff",
    padding: 4,
    borderRadius: 12,
    fontSize: 12,
    marginTop: 4,
    alignSelf: "flex-start",
  },
  skills: { fontSize: 13, color: "#555", marginTop: 6 },
  chatBtn: {
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: "#2563eb",
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  reviewBtn: {
  marginTop: 6,
  paddingVertical: 4,
  paddingHorizontal: 6,
  borderRadius: 6,
  alignSelf: "flex-start",
},

  modalBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 16 },
  modalContent: { backgroundColor: "#fff", borderRadius: 10, padding: 16, maxHeight: "80%" },
  chatBubble: { padding: 8, borderRadius: 10, maxWidth: "70%" },
  messageInput: { flex: 1, borderWidth: 1, borderColor: "#ccc", borderRadius: 5, padding: 5 },
  sendBtn: { paddingHorizontal: 12, justifyContent: "center", backgroundColor: "#0a66c2", borderRadius: 5 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
});
