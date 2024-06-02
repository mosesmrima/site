import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { db, auth } from "../../../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

const initialState = {
    currentUser: {},
    isLoading: false,
    otherUser: {},
    otherUserIsLoading: false,
}

export const getUser = createAsyncThunk("user/getUser", async (_, thunkAPI) => {
    try {
        const authInstance = await auth; // Wait for auth to be initialized
        const user = authInstance.currentUser;
        if (user) {
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);
            return docSnap.data();
        } else {
            return thunkAPI.rejectWithValue("No user is logged in");
        }
    } catch (err) {
        return thunkAPI.rejectWithValue("Can't fetch user");
    }
});

export const getOtherUser = createAsyncThunk("user/getOtherUser", async (uid, thunkAPI) => {
    try {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        return docSnap.data();
    } catch (err) {
        return thunkAPI.rejectWithValue("Can't fetch user");
    }
});

const userSlice = createSlice({
    name: "user",
    initialState,
    extraReducers: (builder) => {
        builder
            .addCase(getUser.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getUser.fulfilled, (state, { payload }) => {
                state.isLoading = false;
                state.currentUser = payload;
            })
            .addCase(getUser.rejected, (state, { payload }) => {
                state.isLoading = false;
            })
            .addCase(getOtherUser.pending, (state) => {
                state.otherUserIsLoading = true;
            })
            .addCase(getOtherUser.fulfilled, (state, { payload }) => {
                state.otherUserIsLoading = false;
                state.otherUser = payload;
            })
            .addCase(getOtherUser.rejected, (state) => {
                state.otherUserIsLoading = false;
            })
    },
});


export default userSlice.reducer;
