import { auth, db } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

export async function skra(email, password, nafn) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await setDoc(doc(db, "users", cred.user.uid), {
    nafn,
    email,
    role: "user",
    createdAt: serverTimestamp()
  });
  return cred.user;
}

export async function skraInn(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function skraInnMedGoogle() {
  const cred = await signInWithPopup(auth, new GoogleAuthProvider());
  const notandaRef = doc(db, "users", cred.user.uid);
  const snap = await getDoc(notandaRef);

  if (!snap.exists()) {
    await setDoc(notandaRef, {
      nafn: cred.user.displayName || cred.user.email,
      email: cred.user.email,
      role: "user",
      createdAt: serverTimestamp()
    });
  }

  return cred.user;
}

export function skraUt() {
  return signOut(auth);
}

// Kallar fallið með notandanum + notendaskjalinu (nafn/role) þegar innskráningarstaða liggur fyrir.
// Ef requireAuth er true og enginn er innskráður er honum vísað á index.html.
// Ef requireAdmin er true og notandinn er ekki admin er honum vísað á leikur.html.
export function vaktaInnskraningu({ requireAuth = true, requireAdmin = false } = {}, callback) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      if (requireAuth) {
        window.location.href = "index.html";
      } else {
        callback(null, null);
      }
      return;
    }

    const snap = await getDoc(doc(db, "users", user.uid));
    const notandagogn = snap.exists() ? snap.data() : { nafn: user.email, role: "user" };

    if (requireAdmin && notandagogn.role !== "admin") {
      window.location.href = "leikur.html";
      return;
    }

    callback(user, notandagogn);
  });
}
