import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { FacilityInquiryProvider } from "./context/FacilityInquiryContext";
import { NotificationProvider } from "./context/NotificationContext";
import { RecoveryRequestProvider } from "./context/RecoveryRequestContext";
import "./styles/globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <NotificationProvider>
        <RecoveryRequestProvider>
          <FacilityInquiryProvider>
            <App />
          </FacilityInquiryProvider>
        </RecoveryRequestProvider>
      </NotificationProvider>
    </BrowserRouter>
  </React.StrictMode>
);
