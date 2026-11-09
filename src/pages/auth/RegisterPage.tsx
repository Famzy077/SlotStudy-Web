import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Gift } from 'lucide-react';
import api, { getErrorMessage, unwrap, wakeServer } from '../../lib/api';
import { useAuth, type User } from '../../lib/auth';
import { AuthLayout, Field } from './AuthLayout';

type TokenResponse = { user: User; accessToken: string; refreshToken: string };

export function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get('ref') || undefined;
  const [values, setValues] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  useEffect(() => {
    wakeServer();
  }, []);

  function update(key: keyof typeof values, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    if (!termsAccepted) {
      setError('Please accept the Terms and Conditions to create an account.');
      return;
    }
    setBusy(true);
    try {
      const payload = {
        ...values,
        termsAccepted: true,
        ...(refCode ? { referralCode: refCode } : {}),
      };
      const { data } = await api.post('/auth/register', payload);
      const response = unwrap<
        TokenResponse & { otpRequired?: boolean; email?: string }
      >(data);
      if (response.otpRequired) {
        navigate(
          `/verify-otp?email=${encodeURIComponent(response.email || values.email)}`,
        );
      } else if (response.accessToken) {
        useAuth.getState().setSession(response);
        navigate('/onboarding/academic-setup');
      }
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout tagline="Your next chapter starts here.">
      <div className="auth-content">
        <span className="eyebrow">GET STARTED</span>
        <h2>Your next chapter starts here</h2>
        <p className="auth-subtitle">
          Create your free account and make studying feel a little lighter.
        </p>
        {refCode && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.25)',
              borderRadius: '10px',
              marginBottom: '16px',
              color: '#16a34a',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            <Gift size={16} />
            <span>
              Invited by a buddy! Code: <strong>{refCode}</strong>
            </span>
          </div>
        )}
        <form className="auth-fields" onSubmit={submit}>
          {error && <div className="form-alert">{error}</div>}
          <Field
            label="Full name"
            value={values.name}
            onChange={(value) => update('name', value)}
            placeholder="Your full name"
            autoComplete="name"
          />
          <Field
            label="Username"
            value={values.username}
            onChange={(value) => update('username', value)}
            placeholder="Choose a username"
            autoComplete="username"
          />
          <Field
            label="Email address"
            type="email"
            value={values.email}
            onChange={(value) => update('email', value)}
            placeholder="you@university.edu"
            autoComplete="email"
          />
          <Field
            label="Password"
            type={passwordVisible ? 'text' : 'password'}
            value={values.password}
            onChange={(value) => update('password', value)}
            placeholder="At least 6 characters"
            autoComplete="new-password"
            right={
              <button
                className="field-icon"
                type="button"
                aria-label={passwordVisible ? 'Hide password' : 'Show password'}
                aria-pressed={passwordVisible}
                onClick={() => setPasswordVisible((visible) => !visible)}
              >
                {passwordVisible ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            }
          />
          <label className="check-label policy-check">
            <input
              type="checkbox"
              required
              checked={termsAccepted}
              onChange={(event) => setTermsAccepted(event.target.checked)}
            />{' '}
            I have read and agree to the{' '}
            <Link to="/terms">Terms and Conditions</Link>.
          </label>
          <button className="button button-primary auth-submit" disabled={busy}>
            {busy ? 'Creating account…' : 'Create my account'}
            <ArrowRight size={17} />
          </button>
        </form>
        <div className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </AuthLayout>
  );
}
