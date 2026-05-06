import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorFallbackProps {
  error?: string;
  onRetry?: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error = "Service temporarily unavailable", 
  onRetry 
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center p-6">
      <AlertTriangle className="w-12 h-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold text-muted-foreground mb-2">
        Oops! Something went wrong
      </h3>
      <p className="text-muted-foreground/70 mb-4 max-w-md">
        {error}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-muted-foreground hover:bg-accent transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  );
};