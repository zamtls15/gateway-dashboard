import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  /** Optional label shown in the error card, e.g. "Groups" */
  pageName?: string;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // In production you'd send this to an error-tracking service (e.g. Sentry).
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    const { children, pageName } = this.props;

    if (!error) return children;

    return (
      <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle size={28} />
        </div>

        <div className="flex flex-col gap-2 max-w-sm">
          <p className="font-semibold text-foreground">
            {pageName ? `${pageName} failed to load` : 'Something went wrong'}
          </p>
          <p className="text-sm text-muted-foreground font-mono break-all">
            {error.message}
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={this.reset}
          className="flex items-center gap-2"
        >
          <RotateCcw size={14} />
          Try again
        </Button>
      </div>
    );
  }
}
