import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

window.addEventListener("error", (event) => {
  fetch("/api/frontend-error", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "window.error",
      message: event.message,
      source: event.filename,
      line: event.lineno,
      column: event.colno,
      stack: event.error?.stack || null,
    }),
  }).catch(() => {});
});

window.addEventListener("unhandledrejection", (event) => {
  fetch("/api/frontend-error", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "unhandledrejection",
      reason: event.reason instanceof Error
        ? { message: event.reason.message, stack: event.reason.stack }
        : String(event.reason),
    }),
  }).catch(() => {});
});

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
