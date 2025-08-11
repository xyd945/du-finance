import { LoadingSpinner } from '@/components/loading-spinner';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <LoadingSpinner size="large" />
        <p className="mt-4 text-gray-600">Loading Global Investment Clock...</p>
      </div>
    </div>
  );
}
