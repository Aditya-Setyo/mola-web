// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBPtFuFuIG5-ToWYbpMAYg_q0d1wI-Lk7g",
  authDomain: "mola-26fde.firebaseapp.com",
  projectId: "mola-26fde",
  storageBucket: "mola-26fde.firebasestorage.app",
  messagingSenderId: "818526230695",
  appId: "1:818526230695:web:746d3771508203174be382",
  measurementId: "G-ZSL0SKPSMB"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Provider login
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

export { auth, googleProvider, facebookProvider, signInWithPopup };
