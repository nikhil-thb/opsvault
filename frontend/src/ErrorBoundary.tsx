import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  errorMsg: string;
  errorStack: string;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMsg: "",
    errorStack: ""
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMsg: error.message, errorStack: error.stack || "" };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "2rem", backgroundColor: "#fee2e2", color: "#991b1b", height: "100vh" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>Frontend Crashed!</h1>
          <p style={{ marginTop: "1rem", fontWeight: "bold" }}>{this.state.errorMsg}</p>
          <pre style={{ marginTop: "1rem", padding: "1rem", backgroundColor: "#fef2f2", overflow: "auto", fontSize: "0.875rem" }}>
            {this.state.errorStack}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
