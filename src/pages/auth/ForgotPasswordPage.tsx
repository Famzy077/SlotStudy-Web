import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import api, { getErrorMessage } from '../../lib/api';
import { AuthLayout, Field } from './AuthLayout';

export function ForgotPasswordPage() {
  const [params] = useSearchParams();
  const [email, setEmail] = useState(params.get('email') || '');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [stage, setStage] = useState<'email' | 'reset'>(
    params.has('email') ? 'reset' : 'email',
  );
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (stage === 'email') {
        await api.post('/auth/forgot-password', { email });
        setStage('reset');
        navigate(`/reset-password?email=${encodeURIComponent(email)}`);
      } else {
        await api.post('/auth/reset-password', { email, code, newPassword });
        navigate('/login', {
          state: { notice: 'Password updated. Sign in with your new password.' },
        });
      }
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout>
      <div className="auth-content">
        <Link className="back-link" to="/login">
          <ArrowLeft size={16} /> Back to sign in
        </Link>
        <span className="eyebrow">ACCOUNT RECOVERY</span>
        <h2>{stage === 'email' ? 'Forgot your password?' : 'Choose a new password'}</h2>
        <p className="auth-subtitle">
          {stage === 'email'
            ? 'Enter your email and we’ll send you a reset code.'
            : 'Enter the 6-digit code from your email and your new password.'}
        </p>
        <form className="auth-fields" onSubmit={submit}>
          {error && <div className="form-alert">{error}</div>}
          <Field
            label="Email address"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@university.edu"
            autoComplete="email"
          />
          {stage === 'reset' && (
            <>
              <Field
                label="Reset code"
                value={code}
                onChange={(value) => setCode(value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                autoComplete="one-time-code"
              />
              <Field
                label="New password"
                type="password"
                value={newPassword}
                onChange={setNewPassword}
                placeholder="At least 6 characters"
                autoComplete="new-password"
              />
            </>
          )}
          <button className="button button-primary auth-submit" disabled={busy}>
            {busy
              ? 'Please wait…'
              : stage === 'email'
              ? 'Send reset code'
              : 'Reset password'}
            <ArrowRight size={17} />
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}
