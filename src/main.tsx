import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { setBaseUrl } from "./api-client-react";
import App from "./App";
import "./index.css";

const _origFetch = window.fetch.bind(window);
window.fetch = (input: RequestInfo | URL, init: RequestInit = {}) => {
  const url =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.toString()
        : (input as Request).url;
  if (url.startsWith("/api")) {
    const userId = localStorage.getItem("tradevision_user_id");
    if (userId) {
      // Use the Headers constructor to safely copy existing headers (works even
      // when init.headers is a Headers instance, not a plain object).
      const merged = new Headers(init.headers);
      merged.set("x-user-id", userId);
      init = { ...init, headers: merged };
    }
  }
  return _origFetch(input, init);
};

setBaseUrl(import.meta.env.VITE_API_URL || "");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
