import { lazy, Suspense } from 'react';

const MarkdownRenderer = lazy(() => import('../../MarkdownRenderer'));

export function MarkdownContent({ children }: { children: string }) {
  return (
    <Suspense fallback={<div className="loading-line">Opening your notes…</div>}>
      <MarkdownRenderer>{children}</MarkdownRenderer>
    </Suspense>
  );
}
