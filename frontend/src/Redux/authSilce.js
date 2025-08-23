import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    loding: false,
    user:null,
    signupEmail: null,
  },
  reducers: {
    setLoding: (state, action) => {
      state.loding = action.payload;
    },
    setuser:(state, action)=>{
        state.user=action.payload
    },
     setSignupEmail: (state, action) => {
      state.signupEmail = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setLoding ,setuser,setSignupEmail} = authSlice.actions;

export default authSlice.reducer;
