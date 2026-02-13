import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./shared/Navbar";
import PushNotificationManager from "./PushNotificationManager";
import ChatBot from "./ChatBot";

const Layout = () => {
    return (
        <>
            <Navbar />
            <PushNotificationManager />
            <Suspense fallback={null}>
                <Outlet />
            </Suspense>
            <ChatBot />
        </>
    );
};

export default Layout;
