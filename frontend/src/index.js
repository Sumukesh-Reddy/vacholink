import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { GoogleOAuthProvider } from "@react-oauth/google";

const googleClientId =
  "554451621074-mvnd4i87078039dahlk26lst67ogqal0.apps.googleusercontent.com" || process.env.REACT_APP_GOOGLE_CLIENT_ID ;

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <GoogleOAuthProvider clientId={googleClientId}>
    <App />
  </GoogleOAuthProvider>
);
