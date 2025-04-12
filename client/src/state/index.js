import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  mode: "light",
  user: null,
  token: null,
  posts: [],
  chatMessages: [], // Add this
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setMode: (state) => {
      state.mode = state.mode === "light" ? "dark" : "light";
    },
    setLogin: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    setLogout: (state) => {
      state.user = null;
      state.token = null;
    },
    setFriends: (state, action) => {
      if (state.user) {
        state.user.friends = action.payload.friends;
      } else {
        console.error("user friends non-existent :(");
      }
    },
    setPosts: (state, action) => {
      if (!Array.isArray(action.payload.posts)) {
        console.error("Payload is not an array of posts:", action.payload.posts);
        return;
      }

      const sortedPosts = action.payload.posts.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      state.posts = sortedPosts;
    },
    addPosts: (state, action) => {
      // Merge existing and new posts, remove duplicates, and sort
      const allPosts = [...state.posts, ...action.payload.posts];
      const uniquePosts = Array.from(
        new Map(allPosts.map(post => [post._id, post])).values()
      );
      state.posts = uniquePosts.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
    },
    setPost: (state, action) => {
      const updatedPosts = state.posts.map((post) => {
        if (post._id === action.payload.post._id) return action.payload.post;
        return post;
      });
      state.posts = updatedPosts;
    },
    setChatMessages: (state, action) => {
      state.chatMessages = action.payload;
    },
    addChatMessage: (state, action) => {
      state.chatMessages.push(action.payload);
    },
    deletePost: (state, action) => {
      state.posts = state.posts.filter(post => post._id !== action.payload.postId);
    },
  },
});

export const { setMode, setLogin, setLogout, setFriends, setPosts, addPosts, setPost, setChatMessages, addChatMessage, deletePost } =
  authSlice.actions;
export default authSlice.reducer;
