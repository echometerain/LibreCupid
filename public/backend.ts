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
  let info = await getInfo(userID as string);
  let contacts = info["contacts"];
  let acceptProb = info["totalAccepted"] / info["totalSwipes"];
  let data = await getData(userID as string);

  // get all users
  let compat: (string | number)[][] = [];
  let q = fs.query(fs.collection(db, "data"));
  (await fs.getDocs(q)).forEach((doc) => {
    if (contacts.includes(doc.id)) return;
    const factor = 2;
    let acceptGivenAgree = acceptProb * factor;
    for (let e in Object.keys(data)) {
      let agree = data[e]["isYes"] == doc[e]["isYes"];
      let agreeGivenAccept = data[e]["acceptedAgree"] / info["totalAccepted"];
      let sd = Math.sqrt(
        (agreeGivenAccept * (1 - agreeGivenAccept)) / info["totalAccepted"]
      );
      let prob = gaussianRandom(agreeGivenAccept, sd);
      if (agree) {
        acceptGivenAgree = prob * factor;
      } else {
        acceptGivenAgree = (1 - 1 - prob) * factor;
      }
    }
    compat.push([doc.id, acceptGivenAgree]);
    compat.sort((a, b) => {
      // sort descending
      return (b[1] as number) - (a[1] as number);
    });
    top = compat.slice(0, Math.min(10, compat.length));
  });

  return top;
}
async function gen_question() {
  var count: number = (
    await fs.getCountFromServer(fs.collection(db, "questions"))
  ).data().count;
  let num = Math.floor(Math.random() * count);
  return await fs.getDoc(fs.doc(db, "questions", num.toString()));
}

async function quiz_update(question: number, value: boolean) {
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

async function getData(ID: string) {
  let doc = await fs.getDoc(fs.doc(db, "data", ID as string));
  return doc.data;
}
async function getInfo(ID: string) {
  let doc = await fs.getDoc(fs.doc(db, "users", ID as string));
  return doc.data;
}
