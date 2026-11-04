import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import api, { getErrorMessage, unwrap } from '../../lib/api';
import { useAuth, type User } from '../../lib/auth';
import { AuthLayout, Field } from './AuthLayout';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
          }) => void;
          renderButton: (
            element: HTMLElement,
            options: { theme: string; size: string; width: number; text: string },
          ) => void;
        };
      };
    };
  }
}

type TokenResponse = { user: User; accessToken: string; refreshToken: string };

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const setSession = useAuth((state) => state.setSession);
  const navigate = useNavigate();
  const googleButton = useRef<HTMLDivElement>(null);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!googleClientId || !googleButton.current) return;
    const renderGoogleButton = () => {
      if (!window.google || !googleButton.current) return;
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async ({ credential }) => {
          if (!credential) {
            setError('Google sign-in did not return a valid credential.');
            return;
          }
          setBusy(true);
          setError('');
          try {
            const { data } = await api.post('/auth/google', { idToken: credential });
            const session = unwrap<TokenResponse>(data);
            setSession(session);
            navigate(
              session.user.academicSetupCompleted
                ? '/dashboard'
                : '/onboarding/academic-setup',
              { replace: true },
            );
          } catch (requestError) {
            setError(getErrorMessage(requestError));
          } finally {
            setBusy(false);
          }
        },
      });
      window.google.accounts.id.renderButton(googleButton.current, {
        theme: 'outline',
        size: 'large',
        width: 400,
        text: 'continue_with',
      });
    };
    if (window.google) {
      renderGoogleButton();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = renderGoogleButton;
    document.head.appendChild(script);
  }, [googleClientId, navigate, setSession]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      const session = unwrap<TokenResponse>(data);
      setSession(session);
      navigate(
        session.user.academicSetupCompleted
          ? '/dashboard'
          : '/onboarding/academic-setup',
        { replace: true },
      );
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout>
      <div className="auth-content">
        <span className="eyebrow">WELCOME BACK</span>
        <h2>Good to see you again</h2>
        <p className="auth-subtitle">Pick up right where your curiosity left off.</p>
        <form className="auth-fields" onSubmit={submit}>
          {error && <div className="form-alert">{error}</div>}
          <Field
            label="Email address"
            value={email}
            onChange={setEmail}
            placeholder="you@university.edu"
            autoComplete="email"
          />
          <Field
            label="Password"
            type={visible ? 'text' : 'password'}
            value={password}
            onChange={setPassword}
            placeholder="Enter your password"
            autoComplete="current-password"
            right={
              <button
                className="field-icon"
                type="button"
                aria-label={visible ? 'Hide password' : 'Show password'}
                onClick={() => setVisible(!visible)}
              >
                {visible ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            }
          />
          <div className="form-meta">
            <label className="check-label">
              <input type="checkbox" /> Keep me signed in
            </label>
            <Link to="/forgot-password">Forgot password?</Link>
          </div>
          <button className="button button-primary auth-submit" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
            <ArrowRight size={17} />
          </button>
        </form>
        {googleClientId && (
          <>
            <div className="auth-divider">
              <span>OR</span>
            </div>
            <div className="google-signin" ref={googleButton} />
          </>
        )}
        <div className="auth-switch">
          New to SlotStudy? <Link to="/register">Create an account</Link>
        </div>
        <div className="secure-note">
          <span className="secure-dot" /> Your study space is private and secure
        </div>
      </div>
    </AuthLayout>
  );
}
