import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import {
  getAuth,
  signInWithCustomToken,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";

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
const auth = getAuth(app);
const data = getDatabase(app);
var token;
var user;

function auto_login() {
  signInWithCustomToken(auth, token).then((userCredential) => {
    user = userCredential.user;
  });
}

function firebase_auth() {
  if (token != "") return;
  signInWithPopup(auth, new GoogleAuthProvider())
    .then((result) => {
      const credential = GoogleAuthProvider.credentialFromResult(result);
      token = credential.accessToken;
      user = result.user;
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
    });
}

async function logout() {
  await signOut(auth);
  token = "";
  user = null;
}

function top_matches() {
  var list;
  return list;
}
function gen_question() {}
function get_question() {}
function quiz_update(question, value) {}
function get_stats() {}
function set_stats(arr) {
  // [isYes, mean, sd]
}
function getBio() {
  return bio;
}
function setBio(value) {}