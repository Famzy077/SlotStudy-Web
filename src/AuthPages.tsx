import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Eye, EyeOff, GraduationCap, Sparkles } from 'lucide-react';
import api, { getErrorMessage, unwrap } from './lib/api';
import { useAuth, type User } from './lib/auth';
import BrandLogo from './BrandLogo';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: { client_id: string; callback: (response: { credential?: string }) => void }) => void;
          renderButton: (element: HTMLElement, options: { theme: string; size: string; width: number; text: string }) => void;
        };
      };
    };
  }
}

type TokenResponse = { user: User; accessToken: string; refreshToken: string };

function AuthLayout({ children, tagline = 'A little progress, every day.' }: { children: React.ReactNode; tagline?: string }) {
  return (
    <main className="auth-page">
      <section className="auth-art">
        <div className="auth-art-top"><Link to="/" title="Back to home"><BrandLogo /></Link><span className="auth-version">STUDY SMARTER</span></div>
        <div className="auth-art-copy">
          <div className="auth-orbit"><Sparkles size={18} /><span>Your learning, in focus</span></div>
          <h1>Make room<br />for <em>what matters.</em></h1>
          <p>One calm space for your courses, notes and next big “aha!” moment.</p>
        </div>
        <div className="floating-note"><span className="note-icon">✳</span><div><b>Small steps add up</b><small>{tagline}</small></div><span className="note-check">✓</span></div>
        <div className="art-decoration art-decoration-one" /><div className="art-decoration art-decoration-two" />
      </section>
      <section className="auth-form-side">
        <div className="auth-mobile-brand"><Link to="/" title="Back to home"><BrandLogo /></Link></div>
        <div style={{ marginBottom: 12 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#68728a', fontWeight: 600 }}>
            {/* <ArrowLeft size={14} /> Back to Home */}
          </Link>
        </div>
        {children}
        <div className="auth-footer">© 2026 SlotStudy <span>·</span> Your personal study space</div>
      </section>
    </main>
  );
}

function Field({ label, type = 'text', value, onChange, placeholder, autoComplete, autoFocus = false, right }: {
  label: string; type?: string; value: string; onChange: (value: string) => void; placeholder?: string; autoComplete?: string; autoFocus?: boolean; right?: React.ReactNode;
}) {
  return <label className="form-field"><span>{label}</span><div className="input-wrap"><input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} autoComplete={autoComplete} autoFocus={autoFocus} required />{right}</div></label>;
}

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
          if (!credential) { setError('Google sign-in did not return a valid credential.'); return; }
          setBusy(true);
          setError('');
          try {
            const { data } = await api.post('/auth/google', { idToken: credential });
            const session = unwrap<TokenResponse>(data);
            setSession(session);
            navigate(session.user.academicSetupCompleted ? '/dashboard' : '/onboarding/academic-setup', { replace: true });
          } catch (requestError) { setError(getErrorMessage(requestError)); }
          finally { setBusy(false); }
        },
      });
      window.google.accounts.id.renderButton(googleButton.current, { theme: 'outline', size: 'large', width: 400, text: 'continue_with' });
    };
    if (window.google) { renderGoogleButton(); return; }
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
      navigate(session.user.academicSetupCompleted ? '/dashboard' : '/onboarding/academic-setup', { replace: true });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }

  return <AuthLayout><div className="auth-content"><span className="eyebrow">WELCOME BACK</span><h2>Good to see you again</h2><p className="auth-subtitle">Pick up right where your curiosity left off.</p>
    <form className="auth-fields" onSubmit={submit}>
      {error && <div className="form-alert">{error}</div>}
      <Field label="Email address" value={email} onChange={setEmail} placeholder="you@university.edu" autoComplete="email" />
      <Field label="Password" type={visible ? 'text' : 'password'} value={password} onChange={setPassword} placeholder="Enter your password" autoComplete="current-password" right={<button className="field-icon" type="button" aria-label={visible ? 'Hide password' : 'Show password'} onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={17} /> : <Eye size={17} />}</button>} />
      <div className="form-meta"><label className="check-label"><input type="checkbox" /> Keep me signed in</label><Link to="/forgot-password">Forgot password?</Link></div>
      <button className="button button-primary auth-submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}<ArrowRight size={17} /></button>
    </form>
    {googleClientId && <><div className="auth-divider"><span>OR</span></div><div className="google-signin" ref={googleButton} /></>}
    <div className="auth-switch">New to SlotStudy? <Link to="/register">Create an account</Link></div>
    <div className="secure-note"><span className="secure-dot" /> Your study space is private and secure</div>
  </div></AuthLayout>;
}

export function RegisterPage() {
  const navigate = useNavigate();
  const [values, setValues] = useState({ name: '', username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  function update(key: keyof typeof values, value: string) { setValues((current) => ({ ...current, [key]: value })); }
  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const { data } = await api.post('/auth/register', values);
      const response = unwrap<TokenResponse & { otpRequired?: boolean; email?: string }>(data);
      if (response.otpRequired) navigate(`/verify-otp?email=${encodeURIComponent(response.email || values.email)}`);
      else if (response.accessToken) {
        useAuth.getState().setSession(response);
        navigate('/onboarding/academic-setup');
      }
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }
  return <AuthLayout tagline="Your next chapter starts here."><div className="auth-content"><span className="eyebrow">GET STARTED</span><h2>Your next chapter starts here</h2><p className="auth-subtitle">Create your free account and make studying feel a little lighter.</p>
    <form className="auth-fields" onSubmit={submit}>
      {error && <div className="form-alert">{error}</div>}
      <Field label="Full name" value={values.name} onChange={(value) => update('name', value)} placeholder="Your full name" autoComplete="name" />
      <Field label="Username" value={values.username} onChange={(value) => update('username', value)} placeholder="Choose a username" autoComplete="username" />
      <Field label="Email address" type="email" value={values.email} onChange={(value) => update('email', value)} placeholder="you@university.edu" autoComplete="email" />
      <Field label="Password" type="password" value={values.password} onChange={(value) => update('password', value)} placeholder="At least 6 characters" autoComplete="new-password" />
      <label className="check-label policy-check"><input type="checkbox" required /> I agree to the <a href="#terms">Terms of Service</a> and Privacy Policy.</label>
      <button className="button button-primary auth-submit" disabled={busy}>{busy ? 'Creating account…' : 'Create my account'}<ArrowRight size={17} /></button>
    </form>
    <div className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></div>
  </div></AuthLayout>;
}

export function VerifyOtpPage() {
  const [params] = useSearchParams();
  const email = params.get('email') || '';
  const [code, setCode] = useState('');
  const [seconds, setSeconds] = useState(60);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
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
    } catch (requestError) { setError(getErrorMessage(requestError)); }
    finally { setBusy(false); }
  }
  async function resend() {
    setError('');
    try { await api.post('/auth/register/resend-otp', { email }); setSeconds(60); }
    catch (requestError) { setError(getErrorMessage(requestError)); }
  }
  return <AuthLayout><div className="auth-content"><Link className="back-link" to="/register"><ArrowLeft size={16} /> Back</Link><span className="eyebrow">EMAIL VERIFICATION</span><h2>Check your inbox</h2><p className="auth-subtitle">We sent a 6-digit code to <b>{email || 'your email address'}</b>. It’s valid for 10 minutes.</p>
    <form className="auth-fields" onSubmit={verify}>{error && <div className="form-alert">{error}</div>}
      <Field label="Verification code" value={code} onChange={(value) => setCode(value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" autoComplete="one-time-code" autoFocus />
      <button className="button button-primary auth-submit" disabled={busy || code.length !== 6}>{busy ? 'Verifying…' : 'Verify email'}<ArrowRight size={17} /></button>
    </form>
    <div className="auth-switch">{seconds ? `Resend code in 0:${String(seconds).padStart(2, '0')}` : <button className="text-button" onClick={resend}>Resend verification code</button>}</div>
  </div></AuthLayout>;
}

export function ForgotPasswordPage() {
  const [params] = useSearchParams();
  const [email, setEmail] = useState(params.get('email') || '');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [stage, setStage] = useState<'email' | 'reset'>(params.has('email') ? 'reset' : 'email');
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
        navigate('/login', { state: { notice: 'Password updated. Sign in with your new password.' } });
      }
    } catch (requestError) { setError(getErrorMessage(requestError)); }
    finally { setBusy(false); }
  }
  return <AuthLayout><div className="auth-content"><Link className="back-link" to="/login"><ArrowLeft size={16} /> Back to sign in</Link><span className="eyebrow">ACCOUNT RECOVERY</span><h2>{stage === 'email' ? 'Forgot your password?' : 'Choose a new password'}</h2><p className="auth-subtitle">{stage === 'email' ? 'Enter your email and we’ll send you a reset code.' : 'Enter the 6-digit code from your email and your new password.'}</p>
    <form className="auth-fields" onSubmit={submit}>{error && <div className="form-alert">{error}</div>}
      <Field label="Email address" type="email" value={email} onChange={setEmail} placeholder="you@university.edu" autoComplete="email" />
      {stage === 'reset' && <><Field label="Reset code" value={code} onChange={(value) => setCode(value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" autoComplete="one-time-code" /><Field label="New password" type="password" value={newPassword} onChange={setNewPassword} placeholder="At least 6 characters" autoComplete="new-password" /></>}
      <button className="button button-primary auth-submit" disabled={busy}>{busy ? 'Please wait…' : stage === 'email' ? 'Send reset code' : 'Reset password'}<ArrowRight size={17} /></button>
    </form>
  </div></AuthLayout>;
}

export function AcademicSetupPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [institutions, setInstitutions] = useState<{ id: string; name: string }[]>([]);
  const [programs, setPrograms] = useState<{ id: string; name: string }[]>([]);
  const [institutionId, setInstitutionId] = useState('');
  const [programId, setProgramId] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('1');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const user = useAuth((state) => state.user);
  useEffect(() => {
    const timer = window.setTimeout(async () => {
      try {
        const { data } = await api.get('/academic/institutions', { params: { search } });
        const result = unwrap<{ id: string; name: string }[]>(data);
        setInstitutions(result);
      } catch {
        setError('Could not load institutions. Check your connection and try again.');
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [search]);
  useEffect(() => {
    if (!institutionId) { setPrograms([]); return; }
    api.get('/academic/programs', { params: { institutionId } })
      .then(({ data }) => setPrograms(unwrap<{ id: string; name: string }[]>(data)))
      .catch((requestError: unknown) => setError(getErrorMessage(requestError)));
  }, [institutionId]);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const { data } = await api.post('/academic/setup', { institutionId, programId, yearOfStudy: Number(yearOfStudy) });
      if (user) useAuth.setState({ user: { ...user, ...unwrap<Partial<User>>(data), academicSetupCompleted: true } });
      navigate('/dashboard', { replace: true });
    } catch (requestError) { setError(getErrorMessage(requestError)); }
    finally { setBusy(false); }
  }
  return <AuthLayout tagline="A study plan that feels like yours."><div className="auth-content setup-content"><span className="eyebrow">A LITTLE ABOUT YOU</span><h2>Make SlotStudy yours</h2><p className="auth-subtitle">We’ll tailor your study space to your course and institution.</p>
    <form className="auth-fields" onSubmit={submit}>{error && <div className="form-alert">{error}</div>}
      <label className="form-field"><span>Institution</span><input className="select-input" list="school-options" value={search || institutions.find((school) => school.id === institutionId)?.name || ''} onChange={(event) => { setSearch(event.target.value); setInstitutionId(''); }} placeholder="Search your university" /><datalist id="school-options">{institutions.map((school) => <option key={school.id} value={school.name} />)}</datalist></label>
      <label className="form-field"><span>Choose an institution</span><select className="select-input" value={institutionId} onChange={(event) => { setInstitutionId(event.target.value); setSearch(''); }} required><option value="">Select an institution</option>{institutions.map((school) => <option key={school.id} value={school.id}>{school.name}</option>)}</select></label>
      <label className="form-field"><span>Programme</span><select className="select-input" value={programId} onChange={(event) => setProgramId(event.target.value)} disabled={!institutionId} required><option value="">Select your programme</option>{programs.map((program) => <option key={program.id} value={program.id}>{program.name}</option>)}</select></label>
      <label className="form-field"><span>Year of study</span><select className="select-input" value={yearOfStudy} onChange={(event) => setYearOfStudy(event.target.value)}>{[1, 2, 3, 4, 5, 6].map((year) => <option key={year} value={year}>{year === 6 ? 'Year 6+' : `Year ${year}`}</option>)}</select></label>
      <button className="button button-primary auth-submit" disabled={busy || !institutionId || !programId}>{busy ? 'Saving…' : 'Save my details'}<GraduationCap size={17} /></button>
    </form>
    <button className="skip-button" onClick={() => navigate('/dashboard')}>Skip for now</button>
  </div></AuthLayout>;
}
