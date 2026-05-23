import { Component, type ErrorInfo, type ReactNode } from 'react';

type ErrorBoundaryProps = {
    children: ReactNode;
};

type ErrorBoundaryState = {
    hasError: boolean;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state: ErrorBoundaryState = {
        hasError: false,
    };

    static getDerivedStateFromError(): ErrorBoundaryState {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error('UI error boundary caught an error', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
                    <div className="max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
                        <h1 className="text-xl font-bold text-gray-900">Something went wrong</h1>
                        <p className="mt-2 text-sm text-gray-600">
                            The page ran into an unexpected problem. Refresh to try again.
                        </p>
                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className="mt-6 rounded-xl bg-[#1A5336] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
                        >
                            Refresh page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
