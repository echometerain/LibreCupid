import { initializeApp } from "firebase/app";
import * as fs from "firebase/firestore";
import * as fa from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD3Oipp7R4-IP4DYxthQkqKMRt_TX2eyrg",
  authDomain: "librecupid.firebaseapp.com",
  databaseURL: "https://librecupid-default-rtdb.firebaseio.com",
  projectId: "librecupid",
  storageBucket: "librecupid.appspot.com",
  messagingSenderId: "612421511933",
  appId: "1:612421511933:web:14c5d00efd1aea6a9a6c94",
  measurementId: "G-Y8XBJXMFZ1",
};

const app = initializeApp(firebaseConfig);
const auth = fa.getAuth(app);
const db = fs.getFirestore(app);
var token: string | undefined = undefined;
var user: fa.User | undefined = undefined;
var userID: string | undefined = undefined;

function auto_login() {
  if (token == "") return;
  fa.signInWithCustomToken(auth, token as string).then((userCredential) => {
    user = userCredential.user;
  });
}

function firebase_auth() {
  if (token != undefined) return;
  fa.signInWithPopup(auth, new fa.GoogleAuthProvider())
    .then((result) => {
      const credential = fa.GoogleAuthProvider.credentialFromResult(result);
      if (credential == null || credential == undefined) return;
      token = credential.accessToken;
      user = result.user;
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
    });
}

async function logout() {
  await fa.signOut(auth);
  token = "";
  user = undefined;
}

function top_matches() {
  var list;
  return list;
}
async function gen_question() {
  var count: number = (
    await fs.getCountFromServer(fs.collection(db, "questions"))
  ).data().count;
  let num = Math.floor(Math.random() * count);
  return await fs.getDoc(fs.doc(db, "questions", num.toString()));
}

async function quiz_update(question, value) {
  let docRef = fs.doc(db, "data/" + userID, question.toString());
  let doc = await fs.getDoc(docRef);
  if (doc.exists()) {
    fs.updateDoc(docRef, { isYes: value });
  } else {
    fs.setDoc(docRef, {
      acceptedAgree: 0,
      isYes: value,
    });
  }
}

function get_stats(otherUserID) {}
function set_stats(arr) {
  // [isYes, mean, sd]
}
async function getInfo() {
  let doc = await fs.getDoc(fs.doc(db, "users", userID as string));
  return doc;
}
