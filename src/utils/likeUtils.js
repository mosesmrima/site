import { updateDoc, doc, arrayUnion, arrayRemove, getDoc } from "firebase/firestore";
import { db, auth } from "../../firebaseConfig";

// Like a post
export const likePost = async (userUid, postOwnerUid, postId) => {
    const postRef = doc(db, "posts", postOwnerUid, "userPosts", postId);
    await updateDoc(postRef, {
        likes: arrayUnion(userUid)
    });
};

// Unlike a post
export const unlikePost = async (userUid, postOwnerUid, postId) => {
    const postRef = doc(db, "posts", postOwnerUid, "userPosts", postId);
    await updateDoc(postRef, {
        likes: arrayRemove(userUid)
    });
};


// Check if a post is liked by a user
export const checkIfLiked = async (userUid, postOwnerUid, postId) => {
    const sanitizedPostId = postId.replace(/\/+/g, '_');
    const postRef = doc(db, "posts", postOwnerUid, "userPosts", sanitizedPostId);
    const postDoc = await getDoc(postRef);
    if (postDoc.exists()) {
        const likes = postDoc.data().likes || [];
        return likes.includes(userUid);
    }
    return false;
};
