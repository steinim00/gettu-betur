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
  updateDoc,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// Netföng í þessum lista fá sjálfkrafa admin-aðgang við skráningu/innskráningu.
// Sömu netföng eru skráð í firestore.rules svo þetta sé ekki bara "treyst" frá biðlaranum.
const ADMIN_NETFONG = ["steinim00@gmail.com"];

function erAdminNetfang(email) {
  return ADMIN_NETFONG.includes((email || "").toLowerCase());
}

export async function skra(email, password, nafn) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await setDoc(doc(db, "users", cred.user.uid), {
    nafn,
    email,
    role: erAdminNetfang(email) ? "admin" : "user",
    // "MS" = alvöru nemandi, á meðan "aðrir" (t.d. prufuaðgangar) er sleppt
    // úr skjáskotssniði á stjórnborðinu - sjá birtaNotendaRadir í js/admin.js.
    // Nýskráningar eru sjálfgefið "MS".
    flokkur: "MS",
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
      role: erAdminNetfang(cred.user.email) ? "admin" : "user",
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

    const notandaRef = doc(db, "users", user.uid);
    const snap = await getDoc(notandaRef);
    let notandagogn;

    if (snap.exists()) {
      notandagogn = snap.data();
    } else {
      // Sjálfheilun: notandaskjalið vantar, líklega vegna þess að síðan
      // endurvísaði burt (sjá index.html) áður en setDoc-ið í skra()/
      // skraInnMedGoogle() náði að klárast. Búum það til núna svo
      // notandinn hætti ekki að vera "ósýnilegur" í stjórnborðinu.
      notandagogn = {
        nafn: user.displayName || user.email,
        email: user.email,
        role: erAdminNetfang(user.email) ? "admin" : "user",
        createdAt: serverTimestamp()
      };
      await setDoc(notandaRef, notandagogn);
    }

    // Sjálfheilun: ef þetta netfang er á admin-listanum en skjalið segir ekki admin
    // ennþá (t.d. skráð sig inn áður en netfangið var bætt á listann), uppfærum við það.
    if (erAdminNetfang(user.email) && notandagogn.role !== "admin") {
      await updateDoc(notandaRef, { role: "admin" });
      notandagogn.role = "admin";
    }

    if (requireAdmin && notandagogn.role !== "admin") {
      window.location.href = "leikur.html";
      return;
    }

    callback(user, notandagogn);
  });
}
