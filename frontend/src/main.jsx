import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Toaster } from "./components/ui/sonner";
import { store } from "./Redux/store";
import { Provider } from "react-redux";
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/lib/integration/react";
import { Auth0Provider } from "@auth0/auth0-react";
import { SocketProvider } from "./context/SocketContext";
import { NotificationProvider } from "./context/NotificationContext";
import CubeLoader from "./components/shared/CubeLoader";

const persistor = persistStore(store);

import { registerSW } from 'virtual:pwa-register';

const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm("New content available. Reload?")) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log("App is ready to work offline.");
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Auth0Provider
          domain="dev-po1r5cykjnu8e0ld.us.auth0.com"
          clientId="mUjG6TRByGosW1VyMpQlVIGom6UahqLq"
          authorizationParams={{
            redirect_uri: `${window.location.origin}/complete/profile`,
            audience: "http://localhost:5000/api/v2",
          }}
        >
          <SocketProvider>
            <NotificationProvider>
              <App />
              <Toaster />
            </NotificationProvider>
          </SocketProvider>
        </Auth0Provider>
      </PersistGate>
    </Provider>
  </StrictMode>
);

