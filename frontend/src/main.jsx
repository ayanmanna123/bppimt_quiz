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

const persistor = persistStore(store);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Auth0Provider
          domain="dev-po1r5cykjnu8e0ld.us.auth0.com"
          clientId="mUjG6TRByGosW1VyMpQlVIGom6UahqLq"
          authorizationParams={{
            redirect_uri: window.location.origin,
            audience: "http://localhost:5000/api/v2",  
          }}
        >
          <App />
          <Toaster />
        </Auth0Provider>
      </PersistGate>
    </Provider>
  </StrictMode>
);

