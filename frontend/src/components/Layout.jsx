import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./shared/Navbar";

const Layout = () => {
    return (
        <>
            <Navbar />
            <Suspense fallback={
                <div className="flex items-center justify-center min-h-screen bg-slate-50">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            }>
                <Outlet />
            </Suspense>
        </>
    );
};

export default Layout;
