import { getToken } from "firebase/messaging";
import { messaging } from "./firebaseConfig";

export async function requestNotificationPermission() {
  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    console.log("Notification permission denied.");
    return null;
  }
  console.log(localStorage.getItem("jwtToken"))

  console.log("Notification permission granted.");

  

  const token = await getToken(messaging, {
    vapidKey: "BCmwsAU6vh1nF87dkt12bdMtcpkOndmrGH_nRNr0YyP-NvDG0W4rmXma0ekNgpiiUihqL5DHFzBvbP73Fugq210",
  });

  await fetch("http://localhost:8087/api/v1/notifications/fcm-token", {
    method: "POST",
    headers: {
        "Content-Type" : "application/json",
        "Authorization" : `Bearer ${localStorage.getItem("jwtToken")}`,
    },
    body: JSON.stringify({
        token: token,
    }),
  });

  console.log("FCM Token:", token);

  return token;
}