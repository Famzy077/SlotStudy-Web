import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import api, { getErrorMessage, unwrap } from '../../lib/api';
import { useAuth, type User } from '../../lib/auth';
import { AuthLayout } from './AuthLayout';

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
    if (!institutionId) {
      setPrograms([]);
      return;
    }
    api
      .get('/academic/programs', { params: { institutionId } })
      .then(({ data }) => setPrograms(unwrap<{ id: string; name: string }[]>(data)))
      .catch((requestError: unknown) => setError(getErrorMessage(requestError)));
  }, [institutionId]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const { data } = await api.post('/academic/setup', {
        institutionId,
        programId,
        yearOfStudy: Number(yearOfStudy),
      });
      if (user) {
        useAuth.setState({
          user: { ...user, ...unwrap<Partial<User>>(data), academicSetupCompleted: true },
        });
      }
      navigate('/dashboard', { replace: true });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout tagline="A study plan that feels like yours.">
      <div className="auth-content setup-content">
        <span className="eyebrow">A LITTLE ABOUT YOU</span>
        <h2>Make SlotStudy yours</h2>
        <p className="auth-subtitle">
          We’ll tailor your study space to your course and institution.
        </p>
        <form className="auth-fields" onSubmit={submit}>
          {error && <div className="form-alert">{error}</div>}
          <label className="form-field">
            <span>Institution</span>
            <input
              className="select-input"
              list="school-options"
              value={
                search ||
                institutions.find((school) => school.id === institutionId)?.name ||
                ''
              }
              onChange={(event) => {
                setSearch(event.target.value);
                setInstitutionId('');
              }}
              placeholder="Search your university"
            />
            <datalist id="school-options">
              {institutions.map((school) => (
                <option key={school.id} value={school.name} />
              ))}
            </datalist>
          </label>
          <label className="form-field">
            <span>Choose an institution</span>
            <select
              className="select-input"
              value={institutionId}
              onChange={(event) => {
                setInstitutionId(event.target.value);
                setSearch('');
              }}
              required
            >
              <option value="">Select an institution</option>
              {institutions.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span>Programme</span>
            <select
              className="select-input"
              value={programId}
              onChange={(event) => setProgramId(event.target.value)}
              disabled={!institutionId}
              required
            >
              <option value="">Select your programme</option>
              {programs.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.name}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span>Year of study</span>
            <select
              className="select-input"
              value={yearOfStudy}
              onChange={(event) => setYearOfStudy(event.target.value)}
            >
              {[1, 2, 3, 4, 5, 6].map((year) => (
                <option key={year} value={year}>
                  {year === 6 ? 'Year 6+' : `Year ${year}`}
                </option>
              ))}
            </select>
          </label>
          <button
            className="button button-primary auth-submit"
            disabled={busy || !institutionId || !programId}
          >
            {busy ? 'Saving…' : 'Save my details'}
            <GraduationCap size={17} />
          </button>
        </form>
        <button className="skip-button" onClick={() => navigate('/dashboard')}>
          Skip for now
        </button>
      </div>
    </AuthLayout>
  );
}
