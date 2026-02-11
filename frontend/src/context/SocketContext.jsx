import React, { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";
import { useAuth0 } from "@auth0/auth0-react";

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { user, isAuthenticated } = useAuth0();

    useEffect(() => {
        if (isAuthenticated && user) {
            // Connect to the backend URL
            const newSocket = io(import.meta.env.VITE_BACKEND_URL.replace('/api/v1', ''), {
                // Adjust path if needed, usually just base URL is enough if backend is standard socket.io
                // If VITE_BACKEND_URL includes /api/v1, we need to strip it or use a separate VITE_SOCKET_URL
                // Assuming VITE_BACKEND_URL is something like http://localhost:5000/api/v1
                // We need http://localhost:5000
            });

            // Use a cleaner URL approach
            const backendUrl = import.meta.env.VITE_BACKEND_URL
                ? new URL(import.meta.env.VITE_BACKEND_URL).origin
                : "http://localhost:5000";

            const socketInstance = io(backendUrl, {
                query: {
                    userId: user.sub,
                },
            });

            setSocket(socketInstance);

            return () => socketInstance.close();
        } else {
            if (socket) {
                socket.close();
                setSocket(null);
            }
        }
    }, [isAuthenticated, user]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
