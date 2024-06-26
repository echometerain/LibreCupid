import { initializeApp } from "firebase/app";
import * as st from "firebase/storage";
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
const store = st.getStorage(app);
var token: string | undefined;
var user: fa.User | undefined = undefined;
var userID: string | undefined = undefined;

var storedToken = localStorage.getItem("token");
if (storedToken != "" && storedToken != null) {
  token = storedToken;
  auto_login();
}

// autologin based on token
function auto_login() {
  fa.signInWithCustomToken(auth, token as string).then((userCredential) => {
    user = userCredential.user;
    userID = user.uid;
  });
}

// must be called after first login!!!
export async function register(
  photoPath: string,
  firstName: string,
  lastName: string,
  username: string
) {
  let obj = {};
  if (userID == undefined) return;
  obj[userID]["firstName"] = firstName;
  obj[userID]["lastName"] = lastName;
  obj[userID]["username"] = username;

  let imageRef = st.ref(store, userID);
  await st.uploadBytesResumable(
    imageRef,
    await (await fetch(photoPath)).blob()
  );
  st.getDownloadURL(imageRef).then((url) => {
    obj[userID as string]["photoUrl"] = url;
  });
}

// logs user in (returns true if registration is needed)
export async function loginIfRegister(): Promise<boolean> {
  await fa
    .signInWithPopup(auth, new fa.GoogleAuthProvider())
    .then((result) => {
      const credential = fa.GoogleAuthProvider.credentialFromResult(result);
      if (credential == null || credential == undefined) return;
      token = credential.accessToken;
      localStorage.setItem("token", token as string);
      user = result.user;
      userID = user.uid;
    })
    .catch((error) => {
      console.log(error);
      return;
    });
  // register if user doesn't exist
  if (!(await fs.getDoc(fs.doc(db, "users", userID as string))).exists()) {
    return true;
  }
  return false;
}

// check if logged in
export function isLoggedIn(): boolean {
  return user != undefined;
}

// logout
export async function logout() {
  await fa.signOut(auth);
  token = "";
  localStorage.removeItem(token);
  user = undefined;
  userID = undefined;
}

// Standard Normal variate using Box-Muller transform.
function gaussianRandom(mean = 0, stdev = 1) {
  let u = 1 - Math.random(); //Converting [0,1) to (0,1)
  let v = Math.random();
  let z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  // Transform to the desired mean and standard deviation:
  return z * stdev + mean;
}

// get top 10 matches with naive bayes
// returns an array of [userID, matchAmount]
// you can then use that id in getUserInfo and getData
export async function top_matches() {
  // get main user info
  let top: (string | number)[][] = [];
  let info = await getUserInfo(userID as string);
  let seen = info["seen"];
  let acceptProb = info["totalAccepted"] / info["totalSwipes"];
  let data = await getData(userID as string);

  // get all users
  let compat: (string | number)[][] = [];
  let q = fs.query(fs.collection(db, "data")); // get everyone
  // for every user
  (await fs.getDocs(q)).forEach((doc) => {
    if (seen.includes(doc.id)) return; // ignore if already in contacts
    if (getUserInfo(doc.id)["taken"]) return; // ignore if already taken

    const factor = 2; // factor to keep values from exploding
    let acceptGivenAgree = acceptProb * factor; // P(accept | all questions)
    for (let e in Object.keys(data)) {
      let otherData = doc.data() as object;
      // ignore if the other user didn't answer question
      if (!Object.keys(otherData).includes(e)) continue;
      // naive bayes
      let agree = data[e]["isYes"] == otherData[e]["isYes"];
      let agreeGivenAccept = data[e]["acceptedAgree"] / info["totalAccepted"];
      let sd = Math.sqrt(
        // standard deviation
        (agreeGivenAccept * (1 - agreeGivenAccept)) / info["totalAccepted"]
      );
      let prob = gaussianRandom(agreeGivenAccept, sd); // P(question given accept)
      if (agree) {
        acceptGivenAgree = prob * factor;
      } else {
        acceptGivenAgree = (1 - prob) * factor;
      }
    }
    // user id, match proportion
    compat.push([doc.id, acceptGivenAgree]);
  });
  compat.sort((a, b) => {
    // sort descending
    return (b[1] as number) - (a[1] as number);
  });
  top = compat.slice(0, Math.min(20, compat.length));
  return top;
}

// generate question
export async function genQuestion() {
  var count: number = (
    await fs.getCountFromServer(fs.collection(db, "questions"))
  ).data().count;
  let num = Math.floor(Math.random() * count);
  let questionInfo = (
    await fs.getDoc(fs.doc(db, "questions", num.toString()))
  ).data() as object;
  return [num, questionInfo["text"]];
}

// update data after user answers question
export async function quizUpdate(question: number, value: boolean) {
  let docRef = fs.doc(db, "data", userID as string);
  let doc = await fs.getDoc(docRef);
  let obj = {};
  obj[question.toString()]["isYes"] = value;
  if (doc.exists()) {
    fs.updateDoc(docRef, obj);
  } else {
    obj[question.toString()]["acceptedAgree"] = 0;
    fs.setDoc(docRef, obj);
  }
}

// update data when swiping
export async function matchUpdate(otherUser: string, didAccept: boolean) {
  let info = getUserInfo(userID as string);
  let newObj = {};
  newObj["seen"] = info["seen"].push(otherUser);
  newObj["totalSwipes"] = info["totalSwipes"] + 1;
  if (didAccept) {
    newObj["totalAccepted"] = info["totalAccepted"] + 1;
    let us = getData(userID as string);
    let other = getData(otherUser as string);
    for (let e in Object.keys(other)) {
      if (other[e]["isYes"] == us[e]["isYes"]) us[e]["acceptedAgree"]++;
    }
    fs.setDoc(fs.doc(db, "data", userID as string), us);
  }
  fs.updateDoc(fs.doc(db, "users", userID as string), newObj);
}

// get json document from data collection given id
export async function getData(ID: string) {
  let doc = await fs.getDoc(fs.doc(db, "data", ID as string));
  return doc.data() as object;
}

// get json document from info collection given id
export async function getUserInfo(ID: string) {
  let doc = await fs.getDoc(fs.doc(db, "users", ID as string));
  return doc.data() as object;
}

// set user info
export async function setInfoAttrib(
  attrib: string,
  value: number | string | boolean
) {
  let obj = {};
  obj[userID as string][attrib] = value;
  await fs.updateDoc(fs.doc(db, "users", userID as string), obj);
}
