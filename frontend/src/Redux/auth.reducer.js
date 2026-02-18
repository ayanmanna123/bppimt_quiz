import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    loding: false,
    usere: null,
    signupEmail: null,
    darktheme: false,
    theme: 'system'
  },
  reducers: {
    setLoding: (state, action) => {
      state.loding = action.payload;
    },
    setuser: (state, action) => {
      state.usere = action.payload
    },
    setSignupEmail: (state, action) => {
      state.signupEmail = action.payload;
    },
    setdarktheme: (state, action) => {
      state.darktheme = action.payload;
      // Also update theme for consistency if old action is called
      state.theme = action.payload ? 'dark' : 'light';
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
      // Update legacy field for backward compat if needed (optional)
      state.darktheme = action.payload === 'dark';
    }
  },
});

// Action creators are generated for each case reducer function
export const { setLoding, setuser, setSignupEmail, setdarktheme, setTheme } = authSlice.actions;

export default authSlice.reducer;
