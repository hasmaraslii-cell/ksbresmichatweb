import firebase from 'firebase/app';
import 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAwNbuKuaRsFLDxHY4Ay24G-iVMxIVeRDw",
  authDomain: "ksbresmiweb.firebaseapp.com",
  projectId: "ksbresmiweb",
  storageBucket: "ksbresmiweb.appspot.com",
  messagingSenderId: "305101036044",
  appId: "1:305101036044:web:6e3b566567083067e2a4a4"
};

// Initialize Firebase if not already initialized
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const db = firebase.firestore();
export default firebase;
