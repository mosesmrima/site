import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {db, auth, storage} from "../../../firebaseConfig";
import {collectionGroup, doc, getDocs, orderBy, query, serverTimestamp, setDoc, where} from "firebase/firestore";
import {getDownloadURL, ref, uploadBytes} from "firebase/storage";
import {router} from "expo-router";
const initialState = {
    postsLoading: true,
    allPosts: [],
    userPosts: [],
    savingPost: false,
}


export const getAllPosts = createAsyncThunk("posts/getAllPosts", async (_, thunkAPI) => {
    try {
        const postsQuery = query(collectionGroup(db, "userPosts"), orderBy("timeStamp", "desc"));
        const querySnapshot = await getDocs(postsQuery);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
    } catch (err) {
        console.error(err);
        return thunkAPI.rejectWithValue(err);
    }
});

export const getUserPosts = createAsyncThunk("posts/getUserPosts", async (_, thunkAPI) => {
    try {
        const userUid = auth.currentUser.uid;
        const {posts} = thunkAPI.getState()
        return posts.allPosts.filter(post => post.owner.uid === userUid)
    } catch (err) {
        console.error(err);
        return thunkAPI.rejectWithValue(err);
    }
});


export const addPost = createAsyncThunk(
    'posts/addPost',
    async ({ caption, images, currentUser }, { rejectWithValue }) => {
        try {
            let imageUrls = [];
            if (images.length > 0) {
                const imageUploadPromises = images.map(async (imageUri) => {
                    const response = await fetch(imageUri);
                    const blob = await response.blob();
                    const fileRef = ref(storage, `posts/${auth.currentUser.uid}/${new Date().getTime()}-${imageUri.split('/').pop()}`);
                    await uploadBytes(fileRef, blob);
                    return getDownloadURL(fileRef);
                });

                imageUrls = await Promise.all(imageUploadPromises);
            }

            const post = {
                caption,
                images: imageUrls,
                timeStamp: serverTimestamp(),
                owner: {
                    ...currentUser,
                    uid: auth.currentUser.uid
                }
            };

            const postRef = doc(db, "posts", auth.currentUser.uid, "userPosts", `${new Date().getTime()}`);
            await setDoc(postRef, post);
            return post;
        } catch (error) {
            console.error('Error in addPost:', error);
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
        })
        builder.addCase(getAllPosts.rejected, (state) => {
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


        builder.addCase(addPost.pending, (state) => {
            state.savingPost = true
            state.error = null;
        });
        builder.addCase(addPost.fulfilled, (state, action) => {
            state.allPosts.push(action.payload);
            state.userPosts.push(action.payload);
            state.savingPost = false
            router.replace("/")
        });
        builder.addCase(addPost.rejected, (state, action) => {
            state.error = action.payload;
            state.savingPost = false
        });
    }
})


export default postsSlice.reducer