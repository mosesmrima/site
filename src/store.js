import { configureStore } from '@reduxjs/toolkit';
import userReducer from "./features/user/userSlice";
import postsReducer from "./features/posts/postsSlice";
import messagesReducer from "./features/messages/messagesSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    posts: postsReducer,
    messages: messagesReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
       immutableCheck: false,
    }),
});


