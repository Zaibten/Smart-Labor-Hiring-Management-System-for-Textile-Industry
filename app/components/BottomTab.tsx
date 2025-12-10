import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Tab {
  label: string;
  icon: string;
}

interface BottomTabProps {
  tabs: Tab[];
  activeTab?: string;
  userRole?: "Contractor" | "Labour";
}

export default function BottomTab({ tabs, activeTab, userRole }: BottomTabProps) {
  const router = useRouter();
  const pathname = usePathname();

  // ✅ Route mapping based on user role
  const routeMap: Record<string, string> = {
    Home: userRole === "Contractor" ? "/screens/ContractorHomepage" : "/screens/Homepage",
    "Create Jobs": "/screens/CreateJobs",
    "All Jobs": "/screens/ContractorAllJobs",
    "Find Jobs": "/screens/LabourAllJobs", // ✅ Added for Labour role
    Chats: "/screens/ChatList",
    Settings: "/screens/Settings",
  };

  const handleTabPress = (label: string) => {
    const targetPath = routeMap[label];
    if (!targetPath) {
      alert(`${label} screen coming soon!`);
      return;
    }

    if (pathname !== targetPath) {
      router.replace(targetPath as any);
    }
  };

  return (
    <View style={styles.bottomTab}>
      {tabs.map((tab, index) => {
        const isActive = tab.label === activeTab;
        return (
          <TouchableOpacity
            key={index}
            style={styles.tabItem}
            onPress={() => handleTabPress(tab.label)}
          >
            <Ionicons
              name={tab.icon as any}
              size={22}
              color={isActive ? "#fb923c" : "#9ca3af"}
            />
            <Text style={[styles.tabLabel, isActive && styles.activeLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomTab: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#e5e7eb",
    paddingVertical: 10,
    backgroundColor: "#f9fafb",
  },
  tabItem: { alignItems: "center", justifyContent: "center" },
  tabLabel: { marginTop: 4, fontSize: 13, color: "#9ca3af", fontWeight: "600" },
  activeLabel: { color: "#fb923c", fontWeight: "700" },
});
