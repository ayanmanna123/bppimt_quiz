import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./shared/Navbar";
import PushNotificationManager from "./PushNotificationManager";

const Layout = () => {
    return (
        <>
            <Navbar />
            <PushNotificationManager />
            <Suspense fallback={null}>
                <Outlet />
            </Suspense>
        </>
    );
};

export default Layout;
