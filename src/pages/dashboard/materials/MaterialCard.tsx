import { Link } from 'react-router-dom';
import { ArrowRight, Clock3, FileText } from 'lucide-react';
import type { Material } from '../../../types';
import { getPath } from '../../../hooks/useApiQuery';

export function MaterialCard({ material }: { material: Material }) {
  const name = String(
    material.fileName || material.filename || material.title || 'Untitled material',
  );
  const status = String(material.status || 'UNKNOWN').toUpperCase();

  return (
    <Link to={`/summaries/${material.id}`} className="material-card">
      <span
        className={`material-file-icon ${
          name.toLowerCase().endsWith('.pdf') ? 'pdf-icon' : ''
        }`}
      >
        <FileText size={21} />
      </span>
      <span className={`status-pill status-${status.toLowerCase()}`}>{status}</span>
      <b>{name}</b>
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
        <ArrowRight size={15} />
      </span>
    </Link>
  );
}
