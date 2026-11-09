import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import api, { getErrorMessage, unwrap, wakeServer } from '../../lib/api';
import { useAuth, type User } from '../../lib/auth';
import { AuthLayout, Field } from './AuthLayout';

type TokenResponse = { user: User; accessToken: string; refreshToken: string };

export function VerifyOtpPage() {
  const [params] = useSearchParams();
  const email = params.get('email') || '';
  const [code, setCode] = useState('');
  const [seconds, setSeconds] = useState(60);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    wakeServer();
  }, []);

  useEffect(() => {
    if (!seconds) return;
    const timer = window.setTimeout(() => setSeconds((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [seconds]);

  async function verify(event: FormEvent) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const { data } = await api.post('/auth/register/verify-otp', { email, code });
      useAuth.getState().setSession(unwrap<TokenResponse>(data));
      navigate('/onboarding/academic-setup', { replace: true });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    setError('');
    try {
      await api.post('/auth/register/resend-otp', { email });
      setSeconds(60);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }

  return (
    <AuthLayout>
      <div className="auth-content">
        <Link className="back-link" to="/register">
          <ArrowLeft size={16} /> Back
        </Link>
        <span className="eyebrow">EMAIL VERIFICATION</span>
        <h2>Check your inbox</h2>
        <p className="auth-subtitle">
          We sent a 6-digit code to <b>{email || 'your email address'}</b>. It’s valid for 10 minutes.
        </p>
        <form className="auth-fields" onSubmit={verify}>
          {error && <div className="form-alert">{error}</div>}
          <Field
            label="Verification code"
            value={code}
            onChange={(value) => setCode(value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            autoComplete="one-time-code"
            autoFocus
          />
          <button
            className="button button-primary auth-submit"
            disabled={busy || code.length !== 6}
          >
            {busy ? 'Verifying…' : 'Verify email'}
            <ArrowRight size={17} />
          </button>
        </form>
        <div className="auth-switch">
          {seconds ? (
            `Resend code in 0:${String(seconds).padStart(2, '0')}`
          ) : (
            <button className="text-button" onClick={resend}>
              Resend verification code
            </button>
          )}
        </div>
      </div>
    </AuthLayout>
  );
}
