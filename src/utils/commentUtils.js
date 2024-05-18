import { collection, addDoc, getDocs, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../firebaseConfig";

// Add a comment to a post
export const addComment = async (postOwnerUid, postId, commentText) => {
    const comment = {
        userId: auth.currentUser.uid,
        text: commentText,
        timeStamp: serverTimestamp(),
    };
    const commentsRef = collection(db, "posts", postOwnerUid, "userPosts", postId, "comments");
    await addDoc(commentsRef, comment);
};

// Get comments for a post along with user data
export const getComments = async (postOwnerUid, postId) => {
    const commentsRef = collection(db, "posts", postOwnerUid, "userPosts", postId, "comments");
    const querySnapshot = await getDocs(commentsRef);
    let comments = [];

    for (const commentDoc of querySnapshot.docs) {
        const commentData = commentDoc.data();
        const userDocRef = doc(db, "users", commentData.userId);
        const userDoc = await getDoc(userDocRef);
        const userData = userDoc.exists() ? userDoc.data() : {};
        comments.push({ ...commentData, userName: `${userData.firstName} ${userData.lastName}`, profilePic: userData.profilePic });
    }


    comments.sort((a, b) => a.timeStamp.toMillis() - b.timeStamp.toMillis());

    return comments;
};

