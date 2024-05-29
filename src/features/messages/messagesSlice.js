import {createSlice} from '@reduxjs/toolkit';





const initialState = {
    otherUser: {}
}


const messageSlice = createSlice({
    name: 'messages',
    initialState,
    reducers: {
        setOtherUser: (state, {payload}) => {
            state.otherUser = payload;
        }
    }
})

export const {setOtherUser} = messageSlice.actions;

export default messageSlice.reducer