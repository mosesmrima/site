import { auth } from '../firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';

export const signUp = (email, password, firstName, lastName) => {
    return createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {

            return updateProfile(userCredential.user, {
                displayName: `${firstName} ${lastName}`,
            }).then (() => userCredential);
        });
}

export const signIn = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
}

export const signOutUser = () => {
    return signOut(auth);
}