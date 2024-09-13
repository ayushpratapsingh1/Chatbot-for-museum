import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCMk4OuBRvQr8JBAiq0LU2d79UJ370dI0g",
    authDomain: "chat-952cb.firebaseapp.com",
    projectId: "chat-952cb",
    storageBucket: "chat-952cb.appspot.com",
    messagingSenderId: "195902439311",
    appId: "1:195902439311:web:c9d0e55c7900ffcf0395fa",
    measurementId: "G-KMEEZTGLXK"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };