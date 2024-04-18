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
var token: string | undefined = undefined;
var user: fa.User | undefined = undefined;
var userID: string | undefined = undefined;

function auto_login() {
  if (token == undefined) return;
  fa.signInWithCustomToken(auth, token as string).then((userCredential) => {
    user = userCredential.user;
  });
}

// must be called after first login!!!
async function register(
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
  let imageUpload = await st.uploadBytesResumable(
    imageRef,
    await (await fetch(photoPath)).blob()
  );
  st.getDownloadURL(imageRef).then((url) => {
    obj[userID as string]["photoUrl"] = url;
  });
}

async function loginIfRegister(): Promise<boolean> {
  await fa
    .signInWithPopup(auth, new fa.GoogleAuthProvider())
    .then((result) => {
      const credential = fa.GoogleAuthProvider.credentialFromResult(result);
      if (credential == null || credential == undefined) return;
      token = credential.accessToken;
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

function isLoggedIn(): boolean {
  return user != undefined;
}

async function logout() {
  await fa.signOut(auth);
  token = "";
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

async function top_matches() {
  // get main user info
  let top: (string | number)[][] = [];
  let info = await getUserInfo(userID as string);
  let contacts = info["contacts"];
  let acceptProb = info["totalAccepted"] / info["totalSwipes"];
  let data = await getData(userID as string);

  // get all users
  let compat: (string | number)[][] = [];
  let q = fs.query(fs.collection(db, "data")); // get everyone
  // for every user
  (await fs.getDocs(q)).forEach((doc) => {
    if (contacts.includes(doc.id)) return; // ignore if already in contacts
    const factor = 2; // factor to keep values from exploding
    let acceptGivenAgree = acceptProb * factor; // P(accept | all questions)
    for (let e in Object.keys(data)) {
      // ignore if the other user didn't answer question
      if (!Object.keys(doc.data).includes(e)) continue;
      // naive bayes
      let agree = data[e]["isYes"] == doc.data[e]["isYes"];
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
async function genQuestion() {
  var count: number = (
    await fs.getCountFromServer(fs.collection(db, "questions"))
  ).data().count;
  let num = Math.floor(Math.random() * count);
  return await fs.getDoc(fs.doc(db, "questions", num.toString()));
}

// update user data on question
async function quizUpdate(question: number, value: boolean) {
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

// update when swiping;
async function matchUpdate(otherUser: String, didAccept: boolean) {
  let info = getUserInfo(userID as string);
  let newObj = {};
  newObj["totalSwipes"] = info["totalSwipes"] + 1;
  fs.updateDoc(fs.doc(db, "users", userID as string), newObj);
  if (didAccept) {
    let us = (await fs.getDoc(fs.doc(db, "data", userID as string))).data;
    let other = (await fs.getDoc(fs.doc(db, "data", otherUser as string))).data;
    for (let e in Object.keys(other)) {
      if (other[e]["isYes"] == us[e]["isYes"]) us[e]["acceptedAgree"]++;
    }
    fs.setDoc(fs.doc(db, "data", userID as string), us);
  }
}

async function getData(ID: string) {
  let doc = await fs.getDoc(fs.doc(db, "data", ID as string));
  return doc.data;
}

async function getUserInfo(ID: string) {
  let doc = await fs.getDoc(fs.doc(db, "users", ID as string));
  return doc.data;
}
