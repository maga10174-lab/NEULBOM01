// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAKXOaU6YvO_cuKdmCTz50v1NB9XtJY8J4",
  authDomain: "gen-lang-client-0912692873.firebaseapp.com",
  projectId: "gen-lang-client-0912692873",
  storageBucket: "gen-lang-client-0912692873.firebasestorage.app",
  messagingSenderId: "954114529049",
  appId: "1:954114529049:web:ef9e2995d09ae74db1d788",
  measurementId: "G-VV5YDSFEVK"
};

console.log("현재 연결된 Firebase 프로젝트 ID:", firebaseConfig.projectId);


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase services
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
