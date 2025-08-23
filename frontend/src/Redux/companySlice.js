import { createSlice } from "@reduxjs/toolkit";

const companySlice = createSlice({
  name: "company",
  initialState: {
    singlecompany: null,
    companies:[],
    searchcompanyBytext:""
  },
  reducers: {
    setsinglecompany: (state, action) => {
      state.singlecompany = action.payload;

    },
    setcompanies:(state , action)=>{
      state.companies=action.payload
    },
     setsearchcompanyBytext:(state , action)=>{
      state.searchcompanyBytext=action.payload
    }
  },
});

export const { setsinglecompany, setcompanies, setsearchcompanyBytext } = companySlice.actions;

export default companySlice.reducer;
