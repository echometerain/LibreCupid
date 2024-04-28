"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g;
    return (
      (g = { next: verb(0), throw: verb(1), return: verb(2) }),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                  ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                  : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.setInfoAttrib =
  exports.getUserInfo =
  exports.getData =
  exports.matchUpdate =
  exports.quizUpdate =
  exports.genQuestion =
  exports.top_matches =
  exports.logout =
  exports.isLoggedIn =
  exports.loginIfRegister =
  exports.register =
    void 0;
var app_1 = require("firebase/app");
var st = require("firebase/storage");
var fs = require("firebase/firestore");
var fa = require("firebase/auth");
var firebaseConfig = {
  apiKey: "AIzaSyD3Oipp7R4-IP4DYxthQkqKMRt_TX2eyrg",
  authDomain: "librecupid.firebaseapp.com",
  databaseURL: "https://librecupid-default-rtdb.firebaseio.com",
  projectId: "librecupid",
  storageBucket: "librecupid.appspot.com",
  messagingSenderId: "612421511933",
  appId: "1:612421511933:web:14c5d00efd1aea6a9a6c94",
  measurementId: "G-Y8XBJXMFZ1",
};
var app = (0, app_1.initializeApp)(firebaseConfig);
var auth = fa.getAuth(app);
var db = fs.getFirestore(app);
var store = st.getStorage(app);
var token;
var user = undefined;
var userID = undefined;
var storedToken = localStorage.getItem("token");
if (storedToken != "" && storedToken != null) {
  token = storedToken;
  auto_login();
}
// autologin based on token
function auto_login() {
  fa.signInWithCustomToken(auth, token).then(function (userCredential) {
    user = userCredential.user;
    userID = user.uid;
  });
}
// must be called after first login!!!
function register(photoPath, firstName, lastName, username) {
  return __awaiter(this, void 0, void 0, function () {
    var obj, imageRef, _a, _b, _c;
    return __generator(this, function (_d) {
      switch (_d.label) {
        case 0:
          obj = {};
          if (userID == undefined) return [2 /*return*/];
          obj[userID]["firstName"] = firstName;
          obj[userID]["lastName"] = lastName;
          obj[userID]["username"] = username;
          imageRef = st.ref(store, userID);
          _b = (_a = st).uploadBytesResumable;
          _c = [imageRef];
          return [4 /*yield*/, fetch(photoPath)];
        case 1:
          return [4 /*yield*/, _d.sent().blob()];
        case 2:
          return [4 /*yield*/, _b.apply(_a, _c.concat([_d.sent()]))];
        case 3:
          _d.sent();
          st.getDownloadURL(imageRef).then(function (url) {
            obj[userID]["photoUrl"] = url;
          });
          return [2 /*return*/];
      }
    });
  });
}
exports.register = register;
// logs user in (returns true if registration is needed)
function loginIfRegister() {
  return __awaiter(this, void 0, void 0, function () {
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [
            4 /*yield*/,
            fa
              .signInWithPopup(auth, new fa.GoogleAuthProvider())
              .then(function (result) {
                var credential =
                  fa.GoogleAuthProvider.credentialFromResult(result);
                if (credential == null || credential == undefined) return;
                token = credential.accessToken;
                localStorage.setItem("token", token);
                user = result.user;
                userID = user.uid;
              })
              .catch(function (error) {
                console.log(error);
                return;
              }),
          ];
        case 1:
          _a.sent();
          return [4 /*yield*/, fs.getDoc(fs.doc(db, "users", userID))];
        case 2:
          // register if user doesn't exist
          if (!_a.sent().exists()) {
            return [2 /*return*/, true];
          }
          return [2 /*return*/, false];
      }
    });
  });
}
exports.loginIfRegister = loginIfRegister;
// check if logged in
function isLoggedIn() {
  return user != undefined;
}
exports.isLoggedIn = isLoggedIn;
// logout
function logout() {
  return __awaiter(this, void 0, void 0, function () {
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4 /*yield*/, fa.signOut(auth)];
        case 1:
          _a.sent();
          token = "";
          localStorage.removeItem(token);
          user = undefined;
          userID = undefined;
          return [2 /*return*/];
      }
    });
  });
}
exports.logout = logout;
// Standard Normal variate using Box-Muller transform.
function gaussianRandom(mean, stdev) {
  if (mean === void 0) {
    mean = 0;
  }
  if (stdev === void 0) {
    stdev = 1;
  }
  var u = 1 - Math.random(); //Converting [0,1) to (0,1)
  var v = Math.random();
  var z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  // Transform to the desired mean and standard deviation:
  return z * stdev + mean;
}
// get top 10 matches with naive bayes
// returns an array of [userID, matchAmount]
// you can then use that id in getUserInfo and getData
function top_matches() {
  return __awaiter(this, void 0, void 0, function () {
    var top, info, seen, acceptProb, data, compat, q;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          top = [];
          return [4 /*yield*/, getUserInfo(userID)];
        case 1:
          info = _a.sent();
          seen = info["seen"];
          acceptProb = info["totalAccepted"] / info["totalSwipes"];
          return [4 /*yield*/, getData(userID)];
        case 2:
          data = _a.sent();
          compat = [];
          q = fs.query(fs.collection(db, "data"));
          return [4 /*yield*/, fs.getDocs(q)];
        case 3:
          // for every user
          _a.sent().forEach(function (doc) {
            if (seen.includes(doc.id)) return; // ignore if already in contacts
            if (getUserInfo(doc.id)["taken"]) return; // ignore if already taken
            var factor = 2; // factor to keep values from exploding
            var acceptGivenAgree = acceptProb * factor; // P(accept | all questions)
            for (var e in Object.keys(data)) {
              var otherData = doc.data();
              // ignore if the other user didn't answer question
              if (!Object.keys(otherData).includes(e)) continue;
              // naive bayes
              var agree = data[e]["isYes"] == otherData[e]["isYes"];
              var agreeGivenAccept =
                data[e]["acceptedAgree"] / info["totalAccepted"];
              var sd = Math.sqrt(
                // standard deviation
                (agreeGivenAccept * (1 - agreeGivenAccept)) /
                  info["totalAccepted"]
              );
              var prob = gaussianRandom(agreeGivenAccept, sd); // P(question given accept)
              if (agree) {
                acceptGivenAgree = prob * factor;
              } else {
                acceptGivenAgree = (1 - prob) * factor;
              }
            }
            // user id, match proportion
            compat.push([doc.id, acceptGivenAgree]);
          });
          compat.sort(function (a, b) {
            // sort descending
            return b[1] - a[1];
          });
          top = compat.slice(0, Math.min(20, compat.length));
          return [2 /*return*/, top];
      }
    });
  });
}
exports.top_matches = top_matches;
// generate question
function genQuestion() {
  return __awaiter(this, void 0, void 0, function () {
    var count, num, questionInfo;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [
            4 /*yield*/,
            fs.getCountFromServer(fs.collection(db, "questions")),
          ];
        case 1:
          count = _a.sent().data().count;
          num = Math.floor(Math.random() * count);
          return [
            4 /*yield*/,
            fs.getDoc(fs.doc(db, "questions", num.toString())),
          ];
        case 2:
          questionInfo = _a.sent().data();
          return [2 /*return*/, [num, questionInfo["text"]]];
      }
    });
  });
}
exports.genQuestion = genQuestion;
// update data after user answers question
function quizUpdate(question, value) {
  return __awaiter(this, void 0, void 0, function () {
    var docRef, doc, obj;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          docRef = fs.doc(db, "data", userID);
          return [4 /*yield*/, fs.getDoc(docRef)];
        case 1:
          doc = _a.sent();
          obj = {};
          obj[question.toString()]["isYes"] = value;
          if (doc.exists()) {
            fs.updateDoc(docRef, obj);
          } else {
            obj[question.toString()]["acceptedAgree"] = 0;
            fs.setDoc(docRef, obj);
          }
          return [2 /*return*/];
      }
    });
  });
}
exports.quizUpdate = quizUpdate;
// update data when swiping
function matchUpdate(otherUser, didAccept) {
  return __awaiter(this, void 0, void 0, function () {
    var info, newObj, us, other, e;
    return __generator(this, function (_a) {
      info = getUserInfo(userID);
      newObj = {};
      newObj["seen"] = info["seen"].push(otherUser);
      newObj["totalSwipes"] = info["totalSwipes"] + 1;
      if (didAccept) {
        newObj["totalAccepted"] = info["totalAccepted"] + 1;
        us = getData(userID);
        other = getData(otherUser);
        for (e in Object.keys(other)) {
          if (other[e]["isYes"] == us[e]["isYes"]) us[e]["acceptedAgree"]++;
        }
        fs.setDoc(fs.doc(db, "data", userID), us);
      }
      fs.updateDoc(fs.doc(db, "users", userID), newObj);
      return [2 /*return*/];
    });
  });
}
exports.matchUpdate = matchUpdate;
// get json document from data collection given id
function getData(ID) {
  return __awaiter(this, void 0, void 0, function () {
    var doc;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4 /*yield*/, fs.getDoc(fs.doc(db, "data", ID))];
        case 1:
          doc = _a.sent();
          return [2 /*return*/, doc.data()];
      }
    });
  });
}
exports.getData = getData;
// get json document from info collection given id
function getUserInfo(ID) {
  return __awaiter(this, void 0, void 0, function () {
    var doc;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4 /*yield*/, fs.getDoc(fs.doc(db, "users", ID))];
        case 1:
          doc = _a.sent();
          return [2 /*return*/, doc.data()];
      }
    });
  });
}
exports.getUserInfo = getUserInfo;
// set user info
function setInfoAttrib(attrib, value) {
  return __awaiter(this, void 0, void 0, function () {
    var obj;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          obj = {};
          obj[userID][attrib] = value;
          return [4 /*yield*/, fs.updateDoc(fs.doc(db, "users", userID), obj)];
        case 1:
          _a.sent();
          return [2 /*return*/];
      }
    });
  });
}
exports.setInfoAttrib = setInfoAttrib;

module.exports = exports;
