import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
    apiKey: "AIzaSyAU8NUpBWadblyQl87avt9d8A5MRzZUOg0",
    authDomain: "site-96e39.firebaseapp.com",
    projectId: "site-96e39",
    storageBucket: "site-96e39.appspot.com",
    messagingSenderId: "558691899581",
    appId: "1:558691899581:web:7fb2d4719beca3e8847fd4",
    measurementId: "G-PXYJTRJQB0"
};


export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
