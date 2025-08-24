import { createSlice } from "@reduxjs/toolkit";

const subjectShilice = createSlice({
  name: "subject",
  initialState: {
    subjectByquiry: null,
  },
  reducers: {
    setsubjectByquiry: (state, action) => {
      state.subjectByquiry = action.payload;
    },
  },
});
export const { setsubjectByquiry } = subjectShilice.actions;
export default subjectShilice.reducer;
