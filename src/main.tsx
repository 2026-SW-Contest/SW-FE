import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { FacilityInquiryProvider } from "./context/FacilityInquiryContext";
import { NotificationProvider } from "./context/NotificationContext";
import { RecoveryRequestProvider } from "./context/RecoveryRequestContext";
import { LostItemProvider } from "./context/LostItemContext";
import "./styles/globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <RecoveryRequestProvider>
            <LostItemProvider>
              <FacilityInquiryProvider>
                <App />
              </FacilityInquiryProvider>
            </LostItemProvider>
          </RecoveryRequestProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
