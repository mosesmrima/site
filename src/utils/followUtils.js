import { updateDoc, doc, arrayUnion, arrayRemove, getDoc } from "firebase/firestore";
import { db, auth } from "../../firebaseConfig";

export const followUser = async (currentUserUid, targetUserUid) => {
    await updateDoc(doc(db, "users", currentUserUid), {
        following: arrayUnion(targetUserUid)
    });
    await updateDoc(doc(db, "users", targetUserUid), {
        followers: arrayUnion(currentUserUid)
    });
};

export const unfollowUser = async (currentUserUid, targetUserUid) => {
    await updateDoc(doc(db, "users", currentUserUid), {
        following: arrayRemove(targetUserUid)
    });
    await updateDoc(doc(db, "users", targetUserUid), {
        followers: arrayRemove(currentUserUid)
    });
};

export const checkIfFollowing = async (currentUserUid, targetUserUid) => {
    const currentUserDoc = await getDoc(doc(db, "users", currentUserUid));
    if (currentUserDoc.exists()) {
        const following = currentUserDoc.data().following || [];
        return following.includes(targetUserUid);
    }
    return false;
};
