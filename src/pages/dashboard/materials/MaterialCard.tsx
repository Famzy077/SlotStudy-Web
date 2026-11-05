import { Link } from 'react-router-dom';
import { ArrowRight, Clock3, FileText, Trash2 } from 'lucide-react';
import type { Material } from '../../../types';
import { getPath } from '../../../hooks/useApiQuery';

interface MaterialCardProps {
  material: Material;
  isDeleting?: boolean;
  onDelete?: (material: Material) => void;
}

export function MaterialCard({
  material,
  isDeleting = false,
  onDelete,
}: MaterialCardProps) {
  const name = String(
    material.fileName || material.filename || material.title || 'Untitled material',
  );
  const status = String(material.status || 'UNKNOWN').toUpperCase();
  const isProcessing = status === 'PROCESSING';

  return (
    <article className="material-card">
      <span
        className={`material-file-icon ${
          name.toLowerCase().endsWith('.pdf') ? 'pdf-icon' : ''
        }`}
      >
        <FileText size={21} />
      </span>
      <span className={`status-pill status-${status.toLowerCase()}`}>{status}</span>
      <Link to={`/summaries/${material.id}`} className="material-card-title">
        {name}
      </Link>
      <span className="material-course">
        {String(getPath(material, 'course.title', 'No course linked'))}
      </span>
      <span className="material-card-bottom">
        <span>
          <Clock3 size={13} />
          {material.createdAt
            ? new Date(String(material.createdAt)).toLocaleDateString()
            : 'Date unavailable'}
        </span>
        <span className="material-card-actions">
          <Link
            to={`/summaries/${material.id}`}
            className="material-open-link"
            aria-label={`Open summary for ${name}`}
          >
            <ArrowRight size={15} />
          </Link>
          {onDelete && (
            <button
              className="material-delete-button"
              type="button"
              onClick={() => onDelete(material)}
              disabled={isDeleting || isProcessing}
              aria-label={`Delete ${name} and its summary`}
              title={
                isProcessing
                  ? 'Wait until processing finishes before deleting'
                  : 'Delete material and summary'
              }
            >
              {isDeleting ? '…' : <Trash2 size={15} />}
            </button>
          )}
        </span>
      </span>
    </article>
  );
}
