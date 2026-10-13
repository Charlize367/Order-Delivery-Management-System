import { onMessage } from "firebase/messaging";
import { messaging } from "./firebaseConfig";

export function listenForMessages() {
  return onMessage(messaging, (payload) => {
    console.log("Foreground FCM message:", payload);

    const title = payload.notification?.title || "New Notification";
    const body = payload.notification?.body || "";

    // Temporary visual test
    alert(`${title}\n${body}`);
  });
}