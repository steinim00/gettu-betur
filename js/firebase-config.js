// Fylltu inn þín eigin Firebase verkefnisgögn hér.
// Þú finnur þau í Firebase Console -> Project settings -> "Your apps" -> SDK setup and configuration.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBJVzHWeYpvM3-82A9AMusxliBcPXzgfsw",
  authDomain: "ms-gettu-betur.firebaseapp.com",
  projectId: "ms-gettu-betur",
  storageBucket: "ms-gettu-betur.firebasestorage.app",
  messagingSenderId: "724547921344",
  appId: "1:724547921344:web:57e7a7b8da21743be4d425"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Halda innskráningu milli heimsókna/endurloðunar (þar til notandi skráir sig út).
setPersistence(auth, browserLocalPersistence);
