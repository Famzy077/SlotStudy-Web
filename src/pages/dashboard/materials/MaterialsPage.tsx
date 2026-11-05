import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowRight, FileText, Plus, Sparkles, Upload } from 'lucide-react';
import api, { getErrorMessage, unwrap } from '../../../lib/api';
import type { Material } from '../../../types';
import { list, useApiQuery } from '../../../hooks/useApiQuery';
import { PageTitle, QueryNotice, LoadingLine, EmptyState } from '../../../components/common';
import { MaterialCard } from './MaterialCard';

export function MaterialsPage() {
  const result = useApiQuery<unknown>('materials', '/materials');
  const materials = list<Material>(result.data, 'materials');
  const queryClient = useQueryClient();
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [actionNotice, setActionNotice] = useState<{
    message: string;
    type: 'success' | 'warning' | 'error';
  } | null>(null);

  async function deleteMaterial(material: Material) {
    const name = String(
      material.fileName || material.filename || material.title || 'this material',
    );
    if (
      !window.confirm(
        `Delete "${name}" and its generated summary? This cannot be undone.`,
      )
    ) {
      return;
    }

    setDeletingIds((current) => new Set(current).add(material.id));
    setActionNotice(null);
    try {
      const response = unwrap<{ storageCleanupWarning?: string }>(
        (await api.delete(`/materials/${material.id}`)).data,
      );
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['materials'] }),
        queryClient.invalidateQueries({ queryKey: ['summaries'] }),
        queryClient.invalidateQueries({ queryKey: ['summary'] }),
        queryClient.invalidateQueries({ queryKey: ['courses'] }),
      ]);
      setActionNotice(
        response.storageCleanupWarning
          ? { message: response.storageCleanupWarning, type: 'warning' }
          : { message: `"${name}" and its summary were deleted.`, type: 'success' },
      );
    } catch (error) {
      setActionNotice({ message: getErrorMessage(error), type: 'error' });
    } finally {
      setDeletingIds((current) => {
        const next = new Set(current);
        next.delete(material.id);
        return next;
      });
    }
  }

  return (
    <div>
      <PageTitle
        eyebrow="YOUR STUDY LIBRARY"
        title="AI summaries"
        subtitle="Thoughtful notes made from the materials you’ve uploaded."
        action={
          <Link className="button button-primary" to="/materials/upload">
            <Plus size={16} /> Add material
          </Link>
        }
      />
      <QueryNotice error={result.error} />
      <div className="ai-hero">
        <span className="ai-hero-orb">
          <Sparkles size={23} />
        </span>
        <div>
          <span className="eyebrow">YOUR GROUNDED STUDY BUDDY</span>
          <h2>Big ideas, made a little clearer.</h2>
          <p>
            Ask questions about your own notes, get helpful summaries, and study in the
            way that works for you.
          </p>
        </div>
        <Link className="button button-light" to="/study-room">
          Open AI study room <ArrowRight size={15} />
        </Link>
        <span className="ai-hero-star">✦</span>
      </div>

      <div className="section-heading section-heading-row">
        <div>
          <span className="eyebrow">YOUR MATERIALS</span>
          <h2>Recent study notes</h2>
        </div>
      </div>

      {actionNotice && (
        <div
          className={actionNotice.type === 'success' ? 'success-alert' : 'form-alert'}
          role={actionNotice.type === 'error' ? 'alert' : 'status'}
        >
          {actionNotice.message}
        </div>
      )}

      {result.isLoading ? (
        <LoadingLine />
      ) : materials.length ? (
        <div className="materials-grid">
          {materials.map((material) => (
            <MaterialCard
              material={material}
              key={material.id}
              isDeleting={deletingIds.has(material.id)}
              onDelete={deleteMaterial}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title="Nothing to summarize just yet"
          detail="Upload a course handout or lecture slide to create your first study summary."
          action={
            <Link to="/materials/upload" className="button button-primary">
              <Upload size={16} /> Upload a material
            </Link>
          }
        />
      )}
    </div>
  );
}
