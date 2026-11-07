import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { ToastProvider } from "./components/Toast";
import { StoreProvider } from "./data/store";
import { NavProvider } from "./lib/nav";
import { initTelegram } from "./lib/telegram";
import "./index.css";

initTelegram();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <StoreProvider>
      <ToastProvider>
        <NavProvider>
          <App />
        </NavProvider>
      </ToastProvider>
    </StoreProvider>
  </StrictMode>,
);
