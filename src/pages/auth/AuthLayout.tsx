import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import BrandLogo from '../../components/common/BrandLogo';

export function AuthLayout({
  children,
  tagline = 'A little progress, every day.',
}: {
  children: ReactNode;
  tagline?: string;
}) {
  return (
    <main className="auth-page">
      <section className="auth-art">
        <div className="auth-art-top">
          <Link to="/" title="Back to home">
            <BrandLogo />
          </Link>
          <span className="auth-version">STUDY SMARTER</span>
        </div>
        <div className="auth-art-copy">
          <div className="auth-orbit">
            <GraduationCap size={18} />
            <span>Your learning, in focus</span>
          </div>
          <h1>
            Make room
            <br />
            for <em>what matters.</em>
          </h1>
          <p>One calm space for your courses, notes and next big “aha!” moment.</p>
        </div>
        <div className="floating-note">
          <span className="note-icon">✳</span>
          <div>
            <b>Small steps add up</b>
            <small>{tagline}</small>
          </div>
          <span className="note-check">✓</span>
        </div>
        <div className="art-decoration art-decoration-one" />
        <div className="art-decoration art-decoration-two" />
      </section>
      <section className="auth-form-side">
        <div className="auth-mobile-brand">
          <Link to="/" title="Back to home">
            <BrandLogo />
          </Link>
        </div>
        <div style={{ marginBottom: 12 }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              color: '#68728a',
              fontWeight: 600,
            }}
          >
            {/* <ArrowLeft size={14} /> Back to Home */}
          </Link>
        </div>
        {children}
        <div className="auth-footer">
          © {new Date().getFullYear()} SlotStudy <span>·</span> Your personal study space
        </div>
      </section>
    </main>
  );
}

export function Field({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  autoComplete,
  autoFocus = false,
  right,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  right?: ReactNode;
}) {
  return (
    <label className="form-field">
      <span>{label}</span>
      <div className="input-wrap">
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          required
        />
        {right}
      </div>
    </label>
  );
}
