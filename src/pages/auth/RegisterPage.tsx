import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import api, { getErrorMessage, unwrap } from '../../lib/api';
import { useAuth, type User } from '../../lib/auth';
import { AuthLayout, Field } from './AuthLayout';

type TokenResponse = { user: User; accessToken: string; refreshToken: string };

export function RegisterPage() {
  const navigate = useNavigate();
  const [values, setValues] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function update(key: keyof typeof values, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const { data } = await api.post('/auth/register', values);
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
            type="password"
            value={values.password}
            onChange={(value) => update('password', value)}
            placeholder="At least 6 characters"
            autoComplete="new-password"
          />
          <label className="check-label policy-check">
            <input type="checkbox" required /> I agree to the{' '}
            <a href="#terms">Terms of Service</a> and Privacy Policy.
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
