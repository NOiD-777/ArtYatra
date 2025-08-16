interface LoadingSpinnerProps {
  text?: string;
  subtitle?: string;
}

export default function LoadingSpinner({ text = "Loading...", subtitle }: LoadingSpinnerProps) {
  return (
    <div className="text-center py-12" data-testid="loading-spinner">
      <div className="loading-spinner mx-auto mb-6" />
      <h3 className="text-xl font-semibold text-gray-800 mb-3" data-testid="loading-text">
        {text}
      </h3>
      {subtitle && (
        <p className="text-gray-600" data-testid="loading-subtitle">
          {subtitle}
        </p>
      )}
    </div>
  );
}
