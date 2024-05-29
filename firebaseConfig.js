import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { Platform } from "react-native";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAU8NUpBWadblyQl87avt9d8A5MRzZUOg0",
    authDomain: "site-96e39.firebaseapp.com",
    projectId: "site-96e39",
    storageBucket: "site-96e39.appspot.com",
    messagingSenderId: "558691899581",
    appId: "1:558691899581:web:7fb2d4719beca3e8847fd4",
    measurementId: "G-PXYJTRJQB0"
};

// Initialize Firebase app
export const app = initializeApp(firebaseConfig);

let authPromise;

if (Platform.OS !== "web") {
    authPromise = (async () => {
        const { initializeAuth, getReactNativePersistence } = await import('firebase/auth');
        const AsyncStorage = await import('@react-native-async-storage/async-storage');
        return initializeAuth(app, {
            persistence: getReactNativePersistence(AsyncStorage.default)
        });
    })();
} else {
    authPromise = Promise.resolve(getAuth(app));
}

// Export Firebase services
export const auth = authPromise;
export const db = getFirestore(app);
export const storage = getStorage(app);
