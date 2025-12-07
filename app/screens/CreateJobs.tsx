import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import {
    Alert,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import AppBar from "../components/AppBar";
import BottomTab from "../components/BottomTab";

export default function CreateJob() {
const [jobTitle, setJobTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [workers, setWorkers] = useState("");
  const [skill, setSkill] = useState("");
  const [budget, setBudget] = useState("");
  const [contact, setContact] = useState("");

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [user, setUser] = useState({
    _id: "",
    firstName: "",
    lastName: "",
    role: "",
    image: "",
    email:"",
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [myJobs, setMyJobs] = useState([]);

  // Load logged-in contractor info
useEffect(() => {
  const fetchUser = async () => {
    const userData = await AsyncStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      // Save email to local storage if needed
      await AsyncStorage.setItem("userEmail", parsedUser.email);
    }
  };
  fetchUser();
}, []);


  const contractorTabs = [
    { label: "Home", icon: "home" },
    { label: "Create Jobs", icon: "add-circle" },
    { label: "All Jobs", icon: "list" },
    { label: "Chats", icon: "chatbubbles" },
    { label: "Settings", icon: "settings" },
  ];

  const validateForm = () => {
    if (!jobTitle.trim()) return "Please enter job title.";
    if (!description.trim()) return "Please enter job description.";
    if (!location.trim()) return "Please enter location.";
    if (!workers.trim()) return "Please enter number of workers.";
    if (!skill.trim()) return "Please enter skill/trade required.";
    if (!budget.trim()) return "Please enter budget.";
    if (!contact.trim()) return "Please enter contact info.";

    const numWorkers = parseInt(workers);
    if (isNaN(numWorkers) || numWorkers <= 0)
      return "Workers must be a positive number.";

    const jobBudget = parseFloat(budget);
    if (isNaN(jobBudget) || jobBudget <= 0)
      return "Budget must be a positive number.";

    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(contact))
      return "Contact number must be 10–15 digits.";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) return "Start date cannot be in the past.";
    if (endDate < startDate) return "End date cannot be before start date.";

    return null;
  };

const handleSubmit = async () => {
  const error = validateForm();
  if (error) { Alert.alert("Validation Error", error); return; }

  try {
    const response = await fetch("http://192.168.100.39:3000/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: jobTitle,
        description,
        location,
        workersRequired: parseInt(workers),
        skill,
        budget: parseFloat(budget),
        contact,
        startDate,
        endDate,
        createdBy: {
          userId: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          image: user.image,
          email: user.email, // include email here
        },
      }),
    });

    const data = await response.json();
    if (response.ok) {
      Alert.alert("Success", "Job posted successfully!");
      setJobTitle(""); setDescription(""); setLocation("");
      setWorkers(""); setSkill(""); setBudget(""); setContact("");
      setStartDate(new Date()); setEndDate(new Date());
    } else {
      Alert.alert("Error", data.message || "Failed to post job.");
    }
  } catch (err) {
    console.error(err);
    Alert.alert("Error", "Server error. Try again later.");
  }
};


  return (
    <SafeAreaView style={styles.safeArea}>
      <AppBar title="Create Job" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Job Inputs */}
        <TextInput style={styles.input} placeholder="Job Title" value={jobTitle} onChangeText={setJobTitle} />
        <TextInput style={styles.input} placeholder="Job Description" multiline value={description} onChangeText={setDescription} />
        <TextInput style={styles.input} placeholder="Location" value={location} onChangeText={setLocation} />
        <TextInput style={styles.input} placeholder="Number of Workers" keyboardType="numeric" value={workers} onChangeText={setWorkers} />
        <TextInput style={styles.input} placeholder="Skill / Trade Required" value={skill} onChangeText={setSkill} />
        <TextInput style={styles.input} placeholder="Budget" keyboardType="numeric" value={budget} onChangeText={setBudget} />
        <TextInput style={styles.input} placeholder="Contact Info" keyboardType="phone-pad" value={contact} onChangeText={setContact} />

        {/* Start Date */}
        <TouchableOpacity style={styles.dateButton} onPress={() => setShowStartPicker(true)}>
          <Text style={styles.dateText}>Start Date: {startDate.toLocaleDateString()}</Text>
        </TouchableOpacity>
        {showStartPicker && (
          <DateTimePicker value={startDate} minimumDate={new Date()} mode="date" display={Platform.OS === "ios" ? "spinner" : "default"} onChange={(event, date) => { setShowStartPicker(false); if (date) { setStartDate(date); if (date > endDate) setEndDate(date); } }} />
        )}

        {/* End Date */}
        <TouchableOpacity style={styles.dateButton} onPress={() => setShowEndPicker(true)}>
          <Text style={styles.dateText}>End Date: {endDate.toLocaleDateString()}</Text>
        </TouchableOpacity>
        {showEndPicker && (
          <DateTimePicker value={endDate} minimumDate={startDate} mode="date" display={Platform.OS === "ios" ? "spinner" : "default"} onChange={(event, date) => { setShowEndPicker(false); if (date) setEndDate(date); }} />
        )}

        {/* Submit Button */}
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Post Job</Text>
        </TouchableOpacity>
      </ScrollView>

      

      <View style={styles.tabWrapper}>
        <BottomTab tabs={contractorTabs} activeTab="Create Jobs" userRole="Contractor" />
      </View>


      
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  appBar: {
  height: 80,
  backgroundColor: "#fb923c",
  paddingHorizontal: 20,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "flex-start",
  borderBottomLeftRadius: 15,
  borderBottomRightRadius: 15,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  elevation: 5,
},
userImageWrapper: {
  width: 45,
  height: 45,
  borderRadius: 22.5,
  overflow: 'hidden', // this is correct
  marginRight: 12,
  borderWidth: 1,
  borderColor: '#fff',
},
userImage: {
  width: '100%',
  height: '100%',
},


userTextContainer: {
  flexDirection: "column",
},
userName: { fontSize: 17, fontWeight: "700", color: "#fff" },
userRole: { fontSize: 13, color: "#fff", marginTop: 2 },

  userInfo: { flexDirection: "row", alignItems: "center" },
  scrollContent: { padding: 20, paddingBottom: 120 },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    color: "#0f172a",
    backgroundColor: "#f9fafb",
  },
  dateButton: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: "#f9fafb",
  },
  dateText: { color: "#0f172a" },
  button: {
    backgroundColor: "#fb923c",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  tabWrapper: { position: "absolute", bottom: 0, left: 0, right: 0 },
});
