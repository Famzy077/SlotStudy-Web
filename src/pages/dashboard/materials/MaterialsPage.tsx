import { Link } from 'react-router-dom';
import { ArrowRight, FileText, Plus, Sparkles, Upload } from 'lucide-react';
import type { Material } from '../../../types';
import { list, useApiQuery } from '../../../hooks/useApiQuery';
import { PageTitle, QueryNotice, LoadingLine, EmptyState } from '../../../components/common';
import { MaterialCard } from './MaterialCard';

export function MaterialsPage() {
  const result = useApiQuery<unknown>('materials', '/materials');
  const materials = list<Material>(result.data, 'materials');

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

      {result.isLoading ? (
        <LoadingLine />
      ) : materials.length ? (
        <div className="materials-grid">
          {materials.map((material) => (
            <MaterialCard material={material} key={material.id} />
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
