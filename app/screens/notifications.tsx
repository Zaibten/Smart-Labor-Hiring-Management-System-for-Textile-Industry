import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Alert, Platform } from "react-native";

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true, // Add this missing property
    shouldShowList: true, // Add this missing property
  }),
});

class NotificationService {
  private expoPushToken: string | null = null;
  private notificationListener: Notifications.Subscription | null = null;
  private responseListener: Notifications.Subscription | null = null;

  async registerForPushNotificationsAsync(): Promise<string | undefined> {
    let token: string | undefined;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        Alert.alert("Failed to get push token for push notification!");
        return;
      }

      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;
      if (!projectId) {
        Alert.alert("Project ID not found");
        return;
      }

      try {
        token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        console.log("Expo Push Token:", token);
        this.expoPushToken = token;

        // Save token to AsyncStorage
        await AsyncStorage.setItem("expoPushToken", token);

        return token;
      } catch (error) {
        Alert.alert(`Error getting push token: ${error}`);
      }
    } else {
      Alert.alert("Must use physical device for Push Notifications");
    }
  }

  async sendTokenToServer(email: string, token: string): Promise<void> {
    try {
      const response = await fetch(
        "http://192.168.100.177:3000/api/update-push-token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            expoPushToken: token,
          }),
        },
      );

      const data = await response.json();
      if (data.success) {
        console.log("Token sent to server successfully");
      } else {
        console.log("Failed to send token to server");
      }
    } catch (error) {
      console.error("Error sending token to server:", error);
    }
  }

  setupNotificationListeners(): void {
    // Listener for when notification is received while app is foreground
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification: Notifications.Notification) => {
        console.log("Notification received:", notification);
      },
    );

    // Listener for when notification is tapped/opened
    this.responseListener =
      Notifications.addNotificationResponseReceivedListener(
        (response: Notifications.NotificationResponse) => {
          console.log("Notification response:", response);
          const data = response.notification.request.content.data;

          // Navigate based on notification data
          if (data.screen === "JobDetails" && data.jobId) {
            // You can implement navigation here
            console.log("Navigate to job details:", data.jobId);
          }
        },
      );
  }

  removeNotificationListeners(): void {
    if (this.notificationListener) {
      this.notificationListener.remove();
    }
    if (this.responseListener) {
      this.responseListener.remove();
    }
  }

  async initialize(email: string): Promise<void> {
    try {
      const token = await this.registerForPushNotificationsAsync();
      if (token && email) {
        await this.sendTokenToServer(email, token);
      }
      this.setupNotificationListeners();
    } catch (error) {
      console.error("Error initializing notifications:", error);
    }
  }

  getExpoPushToken(): string | null {
    return this.expoPushToken;
  }
}

export default new NotificationService();
