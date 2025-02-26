import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAGoHBweFO52qkSCtB1Tk4FQtq4F0Pz_Cc",
    authDomain: "endless-horizon-40af4.firebaseapp.com",
    projectId: "endless-horizon-40af4",
    storageBucket: "endless-horizon-40af4.appspot.com",
    messagingSenderId: "834668038891",
    appId: "1:834668038891:web:e55ff62bb27c63b9324cae",
    measurementId: "G-D2C0ZNSES0"
  };
  
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Funkcja do zapisywania wyniku
async function saveHighScore(name, score) {
    try {
        const docRef = await addDoc(collection(db, "highScores"), {
            name: name,
            score: score
        });
        console.log("Document written with ID: ", docRef.id);
    } catch (e) {
        console.error("Error adding document: ", e);
    }
}

export { db };
