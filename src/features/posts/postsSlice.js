import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {db, auth, storage} from "../../../firebaseConfig";
import {collectionGroup, doc, getDoc, getDocs, orderBy, query, serverTimestamp, setDoc, deleteDoc} from "firebase/firestore";
import {getDownloadURL, ref, uploadBytes, deleteObject} from "firebase/storage";
import {router} from "expo-router";
const initialState = {
    postsLoading: true,
    allPosts: [],
    userPosts: [],
    savingPost: false,
    otherUserPosts: [],
    otherUserPostsLoading: true,
    firebaseError: null
}


export const getAllPosts = createAsyncThunk("posts/getAllPosts", async (_, thunkAPI) => {
    try {
        const postsQuery = query(collectionGroup(db, "userPosts"), orderBy("timeStamp", "desc"));
        const querySnapshot = await getDocs(postsQuery);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
    } catch (err) {ser
        return thunkAPI.rejectWithValue(err);
    }
});

export const getUserPosts = createAsyncThunk(
    "posts/getUserPosts",
    async (_, thunkAPI) => {
        try {
            const authInstance = await auth;
            const { posts } = thunkAPI.getState();
            return posts.allPosts.filter(post => post.owner.uid === authInstance.currentUser.uid);
        } catch (err) {

            return thunkAPI.rejectWithValue(err);
        }
    }
);

export const getOtherUserPosts = createAsyncThunk(
    "posts/getOtherUserPosts",
    async (uid, thunkAPI) => {
        try {
            const { posts } = thunkAPI.getState();
            return posts.allPosts.filter(post => post.owner.uid === uid);
        } catch (err) {
            console.error(err);
            return thunkAPI.rejectWithValue(err);
        }
    }
);


export const addPost = createAsyncThunk(
    'posts/addPost',
    async ({ caption, images, currentUser }, { rejectWithValue }) => {
        const authInstance = await auth;
        try {
            let imageUrls = [];
            if (images.length > 0) {
                const imageUploadPromises = images.map(async (imageUri) => {
                    const response = await fetch(imageUri);
                    const blob = await response.blob();
                    const fileRef = ref(storage, `posts/${authInstance.currentUser.uid}/${new Date().getTime()}-${imageUri.split('/').pop()}`);
                    await uploadBytes(fileRef, blob);
                    return getDownloadURL(fileRef);
                });

                imageUrls = await Promise.all(imageUploadPromises);
            }
            const postId = `${new Date().getTime()}`.replace(/\/+/g, '_');
            const post = {
                caption,
                images: imageUrls,
                timeStamp: serverTimestamp(),
                owner: {
                    ...currentUser,
                    uid: authInstance.currentUser.uid
                },
                likes: []
            };
            const postRef = doc(db, "posts", authInstance.currentUser.uid, "userPosts", postId);
            await setDoc(postRef, post);
            return post;
        } catch (error) {
            console.error('Error in addPost:', error);
            return rejectWithValue(error.message);
        }
    }
);

export const deletePost = createAsyncThunk(
    'posts/deletePost',
    async ({ postId, uid }, { rejectWithValue }) => {
        try {
            const postRef = doc(db, "posts", uid, "userPosts", postId);
            const postDoc = await getDoc(postRef);

            if (!postDoc.exists()) {
                throw new Error("Post not found");
            }

            const post = postDoc.data();
            const imageDeletePromises = post.images.map(async (imageUrl) => {
                const imageRef = ref(storage, imageUrl);
                await deleteObject(imageRef);
            });

            await Promise.all(imageDeletePromises);
            await deleteDoc(postRef);
            return { postId, uid };
        } catch (error) {
            console.error('Error in deletePost:', error);
            return rejectWithValue(error.message);
        }
    }
);

const postsSlice = createSlice({
    name: "posts",
    initialState,
    extraReducers: (builder) => {
        builder.addCase(getAllPosts.pending, (state) => {
            state.postsLoading = true;
        })
        builder.addCase(getAllPosts.fulfilled, (state, {payload}) => {
            state.postsLoading= false;
            state.allPosts = payload;
            state.firebaseError = null
        })
        builder.addCase(getAllPosts.rejected, (state, {payload}) => {
            state.firebaseError = payload
            state.postsLoading = false;
        })


        builder.addCase(getUserPosts.pending, (state) => {
            state.postsLoading = true;
        })
        builder.addCase(getUserPosts.fulfilled, (state, {payload}) => {
            state.postsLoading= false;
            state.userPosts = payload;
        })
        builder.addCase(getUserPosts.rejected, (state, {payload}) => {
            state.postsLoading = false;
            console.log(payload)
        })

        builder.addCase(getOtherUserPosts.pending, (state) => {
            state.otherUserPostsLoading = true;
        })
        builder.addCase(getOtherUserPosts.fulfilled, (state, {payload}) => {
            state.otherUserPostsLoading= false;
            state.otherUserPosts = payload;
        })
        builder.addCase(getOtherUserPosts.rejected, (state, {payload}) => {
            state.otherUserPostsLoading = false;
            console.log(payload)
        })


        builder.addCase(addPost.pending, (state) => {
            state.savingPost = true
            state.error = null;
        });
        builder.addCase(addPost.fulfilled, (state, action) => {
            state.allPosts.unshift(action.payload);
            state.userPosts.unshift(action.payload);
            state.savingPost = false
            router.replace("/")
        });
        builder.addCase(addPost.rejected, (state, action) => {
            state.error = action.payload;
            state.savingPost = false
        });

        builder.addCase(deletePost.pending, (state) => {
            state.deletingPost = true;
        });
        builder.addCase(deletePost.fulfilled, (state, action) => {
            state.deletingPost = false;
            state.allPosts = state.allPosts.filter(post => post.id !== action.payload.postId);
            state.userPosts = state.userPosts.filter(post => post.id !== action.payload.postId);
        });
        builder.addCase(deletePost.rejected, (state, action) => {
            state.deletingPost = false;
            state.error = action.payload;
        });
    }
})


export default postsSlice.reducer