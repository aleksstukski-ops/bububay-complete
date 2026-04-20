import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

function sendError(payload) {
  fetch("/api/frontend-error", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(() => {});
}

window.addEventListener("error", (event) => {
  sendError({
    type: "window.error",
    message: event.message,
    source: event.filename,
    line: event.lineno,
    column: event.colno,
    stack: event.error?.stack || null,
  });
});

window.addEventListener("unhandledrejection", (event) => {
  sendError({
    type: "unhandledrejection",
    reason: event.reason instanceof Error
      ? { message: event.reason.message, stack: event.reason.stack }
      : String(event.reason),
  });
});

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
