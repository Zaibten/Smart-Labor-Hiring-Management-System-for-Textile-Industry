import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";

import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function UserSkillsScreen() {
  const [userEmail, setUserEmail] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");

  

useEffect(() => {
  const loadUser = async () => {
    const userData = await AsyncStorage.getItem("user");
    const localUser = userData ? JSON.parse(userData) : null;

    if (localUser?.email) {
      setUserEmail(localUser.email.toLowerCase());
      fetchSkills(localUser.email.toLowerCase());
    }
  };
  loadUser();
}, []);


  const fetchSkills = async (email: string) => {
    try {
      const res = await fetch(`http://172.23.212.221:3000/api/user/skills/${email}`);
      const data = await res.json();
      if (data.success) setSkills(data.skills);
    } catch (err) {
      console.log("Error fetching skills:", err);
    }
  };

  const addSkill = async () => {
    if (!newSkill.trim()) return;
    try {
      await fetch(`http://172.23.212.221:3000/api/user/${userEmail}/skills`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ skill: newSkill }),
});

      setSkills([...skills, newSkill]);
      setNewSkill("");
    } catch (err) {
      console.log("Add skill error:", err);
    }
  };

  const deleteSkill = async (index: number) => {
    Alert.alert("Remove Skill", "Are you sure you want to delete this skill?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await fetch(
  `http://172.23.212.221:3000/api/user/${userEmail}/skills/${index}`,
  { method: "DELETE" }
);

            setSkills(skills.filter((_, i) => i !== index));
          } catch (err) {
            console.log("Delete skill error:", err);
          }
        },
      },
    ]);
  };
  const router = useRouter();


  return (
    
    <View style={styles.container}>

        {/* Close Icon */}
{/* <TouchableOpacity 
  style={styles.closeBtn}
  onPress={() => router.push("../screens/Settings")}
>
  <Ionicons name="close" size={28} color="#fb7c3c" />
</TouchableOpacity> */}

      {/* Display User Email */}
<View style={styles.userEmailBox}>
  <Text style={styles.userEmailText}>{userEmail}</Text>
</View>

      <Text style={styles.title}>My Skills</Text>

      {/* Add Skill Input */}
      <View style={styles.addSkillBox}>
        <TextInput
          value={newSkill}
          onChangeText={setNewSkill}
          placeholder="Add new skill"
          style={styles.input}
        />
        <TouchableOpacity style={styles.addBtn} onPress={addSkill}>
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Skills List */}
      <ScrollView style={{ marginTop: 20 }}>
        {skills.length > 0 ? (
          skills.map((skill, index) => (
            <View key={index} style={styles.skillItem}>
              <Text style={styles.skillText}>• {skill}</Text>
              <TouchableOpacity onPress={() => deleteSkill(index)}>
                <Ionicons name="trash" size={22} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={styles.noSkillsText}>No skills added yet</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9", padding: 20 },
  emailText: { fontSize: 16, fontWeight: "600", color: "#555", textAlign: "center", marginBottom: 10 },
  title: { fontSize: 24, fontWeight: "700", color: "#fb7c3c", textAlign: "center", marginBottom: 20 },
  addSkillBox: { flexDirection: "row", alignItems: "center" },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  addBtn: {
    backgroundColor: "#fb7c3c",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginLeft: 10,
  },
  addBtnText: { color: "#fff", fontWeight: "700" },
  skillItem: {
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
  },
  skillText: { fontSize: 16, color: "#111" },
  noSkillsText: { textAlign: "center", marginTop: 30, color: "#777", fontSize: 16 },
  userEmailBox: {
  alignSelf: "center",
  backgroundColor: "#fb7c3c",
  paddingVertical: 8,
  paddingHorizontal: 18,
  borderRadius: 20,
  marginBottom: 10,
  elevation: 4,
},
userEmailText: {
  color: "#fff",
  fontSize: 16,
  fontWeight: "700",
},
closeBtn: {
  position: "absolute",
  top: 20,
  right: 20,
  padding: 6,
  backgroundColor: "#fff",
  borderRadius: 20,
  elevation: 4,
},

});
