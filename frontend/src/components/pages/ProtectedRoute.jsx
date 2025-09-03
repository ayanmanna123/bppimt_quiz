import React from 'react'
import { useEffect } from 'react'
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const ProtectedRoute = ({children}) => {
    const navigate = useNavigate()
    const {usere} = useSelector((store)=> store.auth)
    useEffect(()=>{
        if(usere === null || usere.role === "student"){
            navigate("/notfound")
        }
    })
  return (
    <>
    {children}
    </>
  )
}

export default ProtectedRoute
