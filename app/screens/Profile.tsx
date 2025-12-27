import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const API_URL = "http://172.23.212.221:3000/api/profile";
const HARD_CODED_EMAIL = "silver@gmail.com";

interface ProfileProps {
  email?: string; // optional, fallback to hardcoded email
}

const ORANGE = "#FF7A00";

const Profile: React.FC<ProfileProps> = ({ email }) => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    fetchProfile();
  }, [email]);

  const fetchProfile = async () => {
    try {
      const fetchEmail = email || HARD_CODED_EMAIL;
      const res = await fetch(`${API_URL}/${fetchEmail}`);
      const data = await res.json();
      setProfile(data);

      // Animate fade and slide
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 700,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
      ]).start();
    } catch (error) {
      console.log("Profile Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !profile) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={ORANGE} />
      </View>
    );
  }

const { user = {}, stats = {}, jobsCreated = [], jobsApplied = [] } = profile || {};

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        {/* HEADER */}
        <View style={styles.headerWrapper}>
          <View style={styles.headerCard}>
            <Image source={{ uri: user.image }} style={styles.avatar} />

            <Text style={styles.name}>
              {user.firstName} {user.lastName}
            </Text>

            <Text style={styles.email}>{user.email}</Text>

            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{user.role}</Text>
            </View>

            <Text style={styles.memberSince}>
              Member since {new Date(user.createdAt).getFullYear()}
            </Text>
          </View>
        </View>
{/* REVIEWS SECTION */}
{profile.reviews && profile.reviews.length > 0 ? (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Reviews</Text>
    {profile.reviews.map((review: any, index: number) => (
      <View key={index} style={styles.reviewCard}>
        <Text style={styles.reviewerEmail}>{review.reviewerEmail}</Text>
        <Text style={styles.reviewRating}>
          {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
        </Text>
        {review.feedback ? (
          <Text style={styles.reviewFeedback}>{review.feedback}</Text>
        ) : null}
        <Text style={styles.reviewDate}>
          {new Date(review.createdAt).toDateString()}
        </Text>
      </View>
    ))}
  </View>
) : (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Reviews</Text>
    <Text style={styles.empty}>No reviews yet.</Text>
  </View>
)}

        {/* STATS */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalJobsPosted}</Text>
            <Text style={styles.statLabel}>Jobs Posted</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalJobsApplied}</Text>
            <Text style={styles.statLabel}>Jobs Applied</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {stats.totalApplicantsOnJobs}
            </Text>
            <Text style={styles.statLabel}>Applicants</Text>
          </View>
        </View>

        {/* JOBS CREATED / APPLIED */}
        {user.role === "Contractor" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Jobs Created</Text>

            {jobsCreated.length === 0 ? (
              <Text style={styles.empty}>No jobs created yet.</Text>
            ) : (
              jobsCreated.map((job: any) => (
                <View key={job._id} style={styles.jobCard}>
                  <Text style={styles.jobTitle}>{job.title}</Text>
                  <Text style={styles.jobInfo}>
                    Applicants: {job.applicants?.length || 0}
                  </Text>
                  <Text style={styles.jobInfo}>
                    Posted on: {new Date(job.createdAt).toDateString()}
                  </Text>
                </View>
              ))
            )}
          </View>
        )}

        {user.role === "Labour" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Jobs Applied</Text>

            {jobsApplied.length === 0 ? (
              <Text style={styles.empty}>No applications yet.</Text>
            ) : (
              jobsApplied.map((job: any) => (
                <View key={job.jobId} style={styles.jobCard}>
                  <Text style={styles.jobTitle}>{job.title}</Text>
                  <Text style={styles.jobInfo}>Status: {job.status}</Text>
                  <Text style={styles.jobInfo}>
                    Applied:{" "}
                    {job.appliedAt
                      ? new Date(job.appliedAt).toDateString()
                      : "N/A"}
                  </Text>
                  <Text style={styles.jobInfo}>
                    Contractor: {job.contractor.firstName}{" "}
                    {job.contractor.lastName}
                  </Text>
                </View>
              ))
            )}
          </View>
        )}
      </Animated.View>
    </ScrollView>
  );
};

export default Profile;

// ======================= STYLES =======================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
    padding: 18,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  /** HEADER */
  headerWrapper: {
    marginTop: 10,
    marginBottom: 25,
  },
  headerCard: {
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.9)",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 10,
    borderWidth: 0.5,
    borderColor: "#f5d7b8",
  },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 100,
    borderWidth: 4,
    borderColor: ORANGE,
    marginBottom: 15,
  },
  name: {
    fontSize: 27,
    fontWeight: "800",
    color: "#222",
  },
  email: {
    fontSize: 15,
    color: "#777",
    marginTop: 4,
  },
  roleBadge: {
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: ORANGE,
    elevation: 2,
  },
  roleText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  reviewCard: {
  backgroundColor: "#fff",
  padding: 15,
  borderRadius: 15,
  marginBottom: 12,
  shadowColor: "#000",
  shadowOpacity: 0.08,
  shadowRadius: 10,
  elevation: 3,
},
reviewerEmail: {
  fontWeight: "bold",
  color: "#222",
  marginBottom: 4,
},
reviewRating: {
  color: "#facc15",
  fontSize: 16,
},
reviewFeedback: {
  color: "#555",
  marginTop: 4,
  fontSize: 14,
},
reviewDate: {
  fontSize: 12,
  color: "#999",
  marginTop: 4,
},

  memberSince: {
    marginTop: 10,
    fontSize: 14,
    color: "#555",
    fontStyle: "italic",
  },
  /** STATS */
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 18,
    borderRadius: 18,
    marginHorizontal: 6,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    elevation: 4,
    borderWidth: 0.7,
    borderColor: "#f0d1b0",
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "bold",
    color: ORANGE,
  },
  statLabel: {
    fontSize: 12.5,
    color: "#777",
    marginTop: 5,
  },
  /** SECTIONS */
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 15,
  },
  empty: {
    textAlign: "center",
    color: "#666",
    paddingVertical: 10,
    fontSize: 15,
  },
  /** JOB CARDS */
  jobCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 18,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    elevation: 3,
    borderLeftWidth: 5,
    borderLeftColor: ORANGE,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
    marginBottom: 5,
  },
  jobInfo: {
    fontSize: 14,
    color: "#555",
    marginTop: 3,
  },
});
