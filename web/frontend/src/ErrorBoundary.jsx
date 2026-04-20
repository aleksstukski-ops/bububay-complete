import React from "react";

function sendError(payload) {
  fetch("/api/frontend-error", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(() => {});
}

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || String(error) };
  }

  componentDidCatch(error, info) {
    sendError({
      type: "error-boundary",
      page: this.props.name || "unknown",
      message: error?.message || String(error),
      stack: error?.stack || null,
      componentStack: info?.componentStack || null,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-lg border border-red-500 bg-red-950 p-4 text-red-200">
          <div className="font-bold mb-2">Crash in: {this.props.name}</div>
          <div className="text-sm break-words">{this.state.message}</div>
        </div>
      );
    }
    return this.props.children;
  }
}
