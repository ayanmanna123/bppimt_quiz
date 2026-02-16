import React, { Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./shared/Navbar";
import PushNotificationManager from "./PushNotificationManager";
import ChatBot from "./ChatBot";

const Layout = () => {
    const location = useLocation();
    const isHomePage = location.pathname === "/";

    return (
        <>
            <Navbar />
            <PushNotificationManager showButton={false} />
            <Suspense fallback={null}>
                <Outlet />
            </Suspense>
            {isHomePage && <ChatBot />}
        </>
    );
};

export default Layout;
