import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "swiper/css/bundle";
import "flatpickr/dist/flatpickr.css";
import "./lib/supabase.ts";
import App from "./App.tsx";
import { HelmetProvider } from "react-helmet-async";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppWrapper>
            <App />
          </AppWrapper>
        </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>
  </StrictMode>,
);
