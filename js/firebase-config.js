// Fylltu inn þín eigin Firebase verkefnisgögn hér.
// Þú finnur þau í Firebase Console -> Project settings -> "Your apps" -> SDK setup and configuration.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "SKIPTU-UT-FYRIR-THITT-API-KEY",
  authDomain: "SKIPTU-UT.firebaseapp.com",
  projectId: "SKIPTU-UT",
  storageBucket: "SKIPTU-UT.appspot.com",
  messagingSenderId: "SKIPTU-UT",
  appId: "SKIPTU-UT"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
