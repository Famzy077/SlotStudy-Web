import { lazy, Suspense } from 'react';

const MarkdownRenderer = lazy(() => import('../../MarkdownRenderer'));

export function MarkdownContent({
  children,
  onCitationClick,
}: {
  children: string;
  onCitationClick?: (page: string) => void;
}) {
  return (
    <Suspense fallback={<div className="loading-line">Opening your notes…</div>}>
      <MarkdownRenderer onCitationClick={onCitationClick}>{children}</MarkdownRenderer>
    </Suspense>
  );
}
