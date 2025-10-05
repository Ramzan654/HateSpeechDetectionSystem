import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBZbpaUl8r0NTvPWMDV71S3haqxGAOUMHk",
  authDomain: "hatespeechdetector-52f1c.firebaseapp.com",
  projectId: "hatespeechdetector-52f1c",
  storageBucket: "hatespeechdetector-52f1c.firebasestorage.app",
  messagingSenderId: "254062586365",
  appId: "1:254062586365:web:8650f22e4337e931139194",
  measurementId: "G-8DN6ED3K0B"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { 
  auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  updateProfile
};