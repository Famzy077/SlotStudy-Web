import { CircleHelp } from 'lucide-react';
import { getErrorMessage } from '../../lib/api';

export function QueryNotice({ error }: { error: unknown }) {
  if (!error) return null;
  return (
    <div className="query-notice" role="alert">
      <CircleHelp size={17} />
      <span>Couldn’t load the latest data from SlotStudy API: {getErrorMessage(error)}</span>
    </div>
  );
}
