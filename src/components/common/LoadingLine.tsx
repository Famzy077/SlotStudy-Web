import { LoaderCircle } from 'lucide-react';

export function LoadingLine({ message = 'Loading your study space…' }: { message?: string }) {
  return (
    <div className="loading-line">
      <LoaderCircle className="spin" size={18} /> {message}
    </div>
  );
}
