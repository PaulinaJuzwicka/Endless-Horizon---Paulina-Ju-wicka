import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.x.x/firebase-app.js';
import { getDatabase, ref, push, query, orderByChild, limitToLast } from 'https://www.gstatic.com/firebasejs/9.x.x/firebase-database.js';

const firebaseConfig = {
    apiKey: "AIzaSyAGoHBweFO52qkSCtB1Tk4FQtq4F0Pz_Cc",
    authDomain: "endless-horizon-40af4.firebaseapp.com",
    projectId: "endless-horizon-40af4",
    storageBucket: "endless-horizon-40af4.appspot.com",
    messagingSenderId: "834668038891",
    appId: "1:834668038891:web:e55ff62bb27c63b9324cae",
    measurementId: "G-D2C0ZNSES0"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export async function saveHighScore(playerName, score) {
    try {
        const scoresRef = ref(database, 'highScores');
        await push(scoresRef, {
            name: playerName,
            score: score,
            timestamp: Date.now()
        });
        return true;
    } catch (error) {
        console.error('Błąd podczas zapisywania wyniku:', error);
        return false;
    }
}

export async function getHighScores() {
    try {
        const scoresRef = ref(database, 'highScores');
        const topScoresQuery = query(scoresRef, orderByChild('score'), limitToLast(10));
        const snapshot = await get(topScoresQuery);
        
        const scores = [];
        snapshot.forEach((childSnapshot) => {
            scores.push({
                id: childSnapshot.key,
                ...childSnapshot.val()
            });
        });
        
        return scores.sort((a, b) => b.score - a.score);
    } catch (error) {
        console.error('Błąd podczas pobierania wyników:', error);
        return [];
    }
}