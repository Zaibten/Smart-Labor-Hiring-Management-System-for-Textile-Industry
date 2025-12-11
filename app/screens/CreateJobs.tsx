import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker"; // make sure to install this
import axios from 'axios';
import MapView, { Marker } from 'react-native-maps';

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

// inside your component
const [region, setRegion] = useState({
  latitude: 24.8607, // default: Karachi
  longitude: 67.0011,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
});

// Function to get coordinates from location
const fetchCoordinates = async (address: string) => {
  try {
    if (!address) return;
    const API_KEY = "AIzaSyDLjGuox_0JwC5Y2D4WlYiRgwfz0ppCuHo"; // replace with your API key
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json`,
      { params: { address, key: API_KEY } }
    );
    const { results } = response.data;
    if (results.length > 0) {
      const { lat, lng } = results[0].geometry.location;
      setRegion({ ...region, latitude: lat, longitude: lng });
    }
  } catch (error) {
    console.error("Geocoding error:", error);
  }
};

  
// inside your component state
const [shift, setShift] = useState("Shift A"); // default shift
const [jobTime, setJobTime] = useState(new Date());
const [showTimePicker, setShowTimePicker] = useState(false);


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
  jobTime,
  shift,
  createdBy: {
    userId: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    image: user.image,
    email: user.email,
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
<TextInput
  style={styles.input}
  placeholder="Location"
  value={location}
  onChangeText={(text) => {
    setLocation(text);
    fetchCoordinates(text); // update map on every change
  }}
/>



<View style={{ height: 200, borderRadius: 8, overflow: 'hidden', marginBottom: 15 }}>
  <MapView
    style={{ flex: 1 }}
    region={region}
    onRegionChangeComplete={(r) => setRegion(r)}
  >
    <Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }} />
  </MapView>
</View>

        <TextInput style={styles.input} placeholder="Number of Workers" keyboardType="numeric" value={workers} onChangeText={setWorkers} />
        <TextInput style={styles.input} placeholder="Skill / Trade Required" value={skill} onChangeText={setSkill} />
        <TextInput style={styles.input} placeholder="Budget" keyboardType="numeric" value={budget} onChangeText={setBudget} />
        <TextInput style={styles.input} placeholder="Contact Info" keyboardType="phone-pad" value={contact} onChangeText={setContact} />

{/* Job Time */}
<TouchableOpacity style={styles.dateButton} onPress={() => setShowTimePicker(true)}>
  <Text style={styles.dateText}>
    Job Time: {jobTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
  </Text>
</TouchableOpacity>
{showTimePicker && (
  <DateTimePicker
    value={jobTime}
    mode="time"
    display={Platform.OS === "ios" ? "spinner" : "default"}
    is24Hour={false} // ensure 12-hour format
    onChange={(event, date) => {
      setShowTimePicker(false);
      if (date) setJobTime(date);
    }}
  />
)}


{/* Shift Picker */}
<View style={styles.pickerWrapper}>
  <Text style={styles.pickerLabel}>Select Shift:</Text>
  <Picker
    selectedValue={shift}
    onValueChange={(itemValue) => setShift(itemValue)}
    style={styles.picker}
    dropdownIconColor="#fb923c"
  >
    <Picker.Item label="Shift A" value="Shift A" />
    <Picker.Item label="Shift B" value="Shift B" />
    <Picker.Item label="Shift C" value="Shift C" />
  </Picker>
</View>

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
  pickerWrapper: {
  borderWidth: 1,
  borderColor: "#e5e7eb",
  borderRadius: 8,
  marginBottom: 15,
  backgroundColor: "#f9fafb",
  paddingHorizontal: 12,
  paddingVertical: Platform.OS === "ios" ? 5 : 0,
},
pickerLabel: {
  fontSize: 14,
  fontWeight: "600",
  color: "#0f172a",
  marginBottom: 6,
},
picker: {
  width: "100%",
  color: "#0f172a",
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
