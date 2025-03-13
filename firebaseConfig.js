import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCloQSWwbgcIuYPhcO0Y12hgM6mXny-ya4",
  authDomain: "my-event-d07d2.firebaseapp.com",
  projectId: "my-event-d07d2",
  storageBucket: "my-event-d07d2.firebasestorage.app",
  messagingSenderId: "1189104556",
  appId: "1:1189104556:web:9058e0196626051cf88809",
  measurementId: "G-6KTDEG8FN1",
  databaseURL: "https://my-event-d07d2-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const database = getDatabase(app);
