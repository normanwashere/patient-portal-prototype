import { Component, type ReactNode, type ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="error-boundary-fallback">
                    <AlertTriangle size={48} color="#ef4444" />
                    <h3>Something went wrong</h3>
                    <p>We're sorry, but something unexpected happened. Please try again.</p>
                    <button onClick={this.handleRetry} className="btn-retry">
                        <RefreshCw size={16} /> Try Again
                    </button>
                    <style>{`
                        .error-boundary-fallback {
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            padding: 3rem;
                            text-align: center;
                            min-height: 300px;
                            gap: 1rem;
                        }
                        .error-boundary-fallback h3 {
                            margin: 0;
                            color: #1f2937;
                        }
                        .error-boundary-fallback p {
                            color: #6b7280;
                            max-width: 300px;
                        }
                        .btn-retry {
                            display: flex;
                            align-items: center;
                            gap: 0.5rem;
                            background: var(--color-primary);
                            color: white;
                            border: none;
                            padding: 0.75rem 1.5rem;
                            border-radius: 8px;
                            font-weight: 600;
                            cursor: pointer;
                            transition: transform 0.2s;
                        }
                        .btn-retry:hover {
                            transform: translateY(-2px);
                        }
                    `}</style>
                </div>
            );
        }

        return this.props.children;
    }
}
