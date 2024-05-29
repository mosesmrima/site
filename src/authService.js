import { auth } from '../firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';

export const signUp = async (email, password, firstName, lastName) => {
    const authInstance = await auth;  // Wait for auth to be initialized
    return createUserWithEmailAndPassword(authInstance, email, password)
        .then((userCredential) => {
            return updateProfile(userCredential.user, {
                displayName: `${firstName} ${lastName}`,
            }).then(() => userCredential);
        });
}

export const signIn = async (email, password) => {
    const authInstance = await auth;  // Wait for auth to be initialized
    return signInWithEmailAndPassword(authInstance, email, password);
}

export const signOutUser = async () => {
    const authInstance = await auth;  // Wait for auth to be initialized
    return signOut(authInstance);
}
