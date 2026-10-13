importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBc1y5BcUK63jnWCizQJCsAOjHvCF0bmck",
  authDomain: "quickbite-9c706.firebaseapp.com",
  projectId: "quickbite-9c706",
  storageBucket: "quickbite-9c706.firebasestorage.app",
  messagingSenderId: "368973258274",
  appId: "1:368973258274:web:851f4062b17a05e00db47b",
  measurementId: "G-H0S5SPCTFT"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Received message:", payload);

  const title = payload.notification?.title || "New Notification";
  const body = payload.notification?.body || "";

  console.log("[firebase-messaging-sw.js] About to show notification:", {
    title,
    body
  });

  self.registration
    .showNotification(title, {
      body: body,
    })
    .then(() => {
      console.log(
        "[firebase-messaging-sw.js] Notification displayed successfully!"
      );
    })
    .catch((error) => {
      console.error(
        "[firebase-messaging-sw.js] Failed to display notification:",
        error
      );
    });
});