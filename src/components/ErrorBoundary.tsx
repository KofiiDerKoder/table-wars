'use client';

import { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

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

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      
      return (
        <div className="min-h-screen bg-muted/30 flex items-center justify-center p-8">
          <div className="bg-white border border-border rounded-3xl p-12 max-w-lg text-center shadow-2xl">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-4">Something went wrong</h2>
            <p className="text-muted-foreground mb-6 font-medium">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <Button onClick={this.handleReset} className="font-black uppercase tracking-widest">
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
