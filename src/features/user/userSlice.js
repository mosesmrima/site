import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {db, auth} from "../../../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";




const initialState = {
    currentUser: {},
    isLoading: false,
    otherUser: {},
    otherUserIsLoading: false,
}

export const getUser = createAsyncThunk("user/getUser", async (_, thunkAPI) => {
    try {
        const docRef = doc(db, "users", auth.currentUser.uid)
        const docSnap = await getDoc(docRef);
        return docSnap.data()
    } catch (err){
        console.log(err)
        thunkAPI.rejectWithValue("cant fetch user")
    }
})

export const getOtherUser = createAsyncThunk("user/getOtherUser", async (uid, thunkAPI) => {
    try {
        const docRef = doc(db, "users", uid)
        const docSnap = await getDoc(docRef);
        return docSnap.data()
    } catch (err){
        console.log(err)
        thunkAPI.rejectWithValue("cant fetch user")
    }
})

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        logOut: (state, payload) => {
            state.currentUser = null;
        },
        resetLoadingState: (state) => {
            state.isLoading = false
        }
    },

    extraReducers: (builder) => {
        builder.addCase(getUser.pending, (state) => {
            state.isLoading = true;
        })
        builder.addCase(getUser.fulfilled, (state, {payload}) => {
            state.isLoading = false;
            state.currentUser = payload;
        })
        builder.addCase(getUser.rejected, (state, {payload}) => {
            state.isLoading = false;
        })

        builder.addCase(getOtherUser.pending, (state) => {
            state.otherUserIsLoading = true;
        })
        builder.addCase(getOtherUser.fulfilled, (state, {payload}) => {
            state.otherUserIsLoading = false;
            state.otherUser = payload;
        })
        builder.addCase(getOtherUser.rejected, (state) => {
            state.otherUserIsLoading = false;
        })
    },
})


export const{logOut, resetLoadingState} = userSlice.actions;

export default userSlice.reducer