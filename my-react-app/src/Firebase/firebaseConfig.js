// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging } from "firebase/messaging";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBc1y5BcUK63jnWCizQJCsAOjHvCF0bmck",
  authDomain: "quickbite-9c706.firebaseapp.com",
  projectId: "quickbite-9c706",
  storageBucket: "quickbite-9c706.firebasestorage.app",
  messagingSenderId: "368973258274",
  appId: "1:368973258274:web:851f4062b17a05e00db47b",
  measurementId: "G-H0S5SPCTFT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const messaging = getMessaging(app);