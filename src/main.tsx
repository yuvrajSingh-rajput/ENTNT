import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ToastProvider } from "./components/ui/toast-provider.tsx";
import "./styles/global.css";
import App from "./App.tsx";
import { initializeMSW } from "./lib/msw.ts";

async function enableMocking() {
  await initializeMSW();
}

enableMocking().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
          <ToastProvider>
            <App />
          </ToastProvider>
    </StrictMode>
  );
});
