import { Component, type ReactNode } from "react";

interface ErrorBoundaryProps {
  fallback?: ReactNode;
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="error-boundary-fallback">
          <div className="error-boundary-title">Something went wrong</div>
          <div className="error-boundary-detail">{this.state.error.message}</div>
        </div>
      );
    }
    return this.props.children;
  }
}
