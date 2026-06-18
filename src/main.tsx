import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { TalentPoolProvider } from "./state/TalentPoolContext";
import "./styles/index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <TalentPoolProvider>
        <App />
      </TalentPoolProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
