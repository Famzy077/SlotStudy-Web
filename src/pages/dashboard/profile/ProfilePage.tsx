import { useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowRight, BookOpen, BookOpenCheck, Check, CheckCircle2, Flame, GraduationCap, Trophy } from 'lucide-react';
import api, { getErrorMessage, unwrap } from '../../../lib/api';
import { useAuth } from '../../../lib/auth';
import { formatStudyHours } from '../../../lib/duration';
import { useApiQuery, getPath } from '../../../hooks/useApiQuery';
import { PageTitle, QueryNotice } from '../../../components/common';
import type { DataObject } from '../../../types';

export function ProfilePage() {
  const user = useAuth((state) => state.user);
  const queryClient = useQueryClient();
  const profileQuery = useApiQuery<DataObject>('profile', '/profile');
  const profile = profileQuery.data || {};
  const profileStats = getPath(profile, 'stats', {}) as DataObject;
  const profileName = String(profile.name || user?.name || 'Your profile');
  const profileUsername = String(profile.username || user?.username || '');
  const profileEmail = String(profile.email || user?.email || '—');
  const profileUniversity = String(profile.university || user?.university || 'Add your institution');
  const profileProgram = String(profile.program || user?.program || 'Not added yet');
  const profileYear = profile.yearOfStudy || user?.yearOfStudy;
  const avatarInput = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);

  async function uploadAvatar(file?: File) {
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > 5 * 1024 * 1024) {
      setError('Choose a JPG, PNG or WebP image smaller than 5 MB.');
      return;
    }
    const body = new FormData();
    body.append('file', file);
    setAvatarBusy(true);
    setError('');
    try {
      const { data } = await api.post('/profile/avatar', body);
      const updated = unwrap<Partial<typeof user>>(data);
      const current = useAuth.getState();
      if (current.user) useAuth.setState({ user: { ...current.user, ...updated } });
      await queryClient.invalidateQueries({ queryKey: ['profile'] });
      setSuccess('Your profile photo has been updated.');
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setAvatarBusy(false);
    }
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      const { data } = await api.patch('/profile', { name, username });
      const update = unwrap<Partial<typeof user>>(data);
      const current = useAuth.getState();
      if (current.user && current.accessToken && current.refreshToken) {
        current.setSession({
          user: { ...current.user, ...update },
          accessToken: current.accessToken,
          refreshToken: current.refreshToken,
        });
      }
      await queryClient.invalidateQueries({ queryKey: ['profile'] });
      setSuccess('Your profile has been updated.');
      setEditing(false);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="narrow-page">
      <PageTitle
        eyebrow="THE PERSON BEHIND THE PROGRESS"
        title="Your profile"
        subtitle="A little space that’s yours."
      />
      <QueryNotice error={profileQuery.error} />
      <div className="profile-card">
        <div className="profile-hero">
          <div className="profile-avatar-wrap">
            <input
              ref={avatarInput}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              hidden
              onChange={(event) => void uploadAvatar(event.target.files?.[0])}
            />
            <button
              className="profile-large-avatar"
              onClick={() => avatarInput.current?.click()}
              aria-label="Change profile photo"
            >
              {profile.avatarUrl || user?.avatarUrl ? (
                <img src={String(profile.avatarUrl || user?.avatarUrl)} alt="" />
              ) : (
                profileName.slice(0, 1).toUpperCase()
              )}
            </button>
            <small>{avatarBusy ? 'Uploading…' : 'Change photo'}</small>
          </div>
          <div>
            <h2>{profileName}</h2>
            {profileUsername && <span>@{profileUsername}</span>}
          </div>
          <button className="button button-outline" onClick={() => setEditing(!editing)}>
            {editing ? 'Cancel' : 'Edit profile'}
          </button>
        </div>

        {success && (
          <div className="success-alert">
            <CheckCircle2 size={16} />
            {success}
          </div>
        )}
        {error && <div className="form-alert">{error}</div>}

        {editing && (
          <form className="modal-form profile-edit-form" onSubmit={save}>
            <label className="form-field">
              <span>Full name</span>
              <input value={name} onChange={(event) => setName(event.target.value)} required />
            </label>
            <label className="form-field">
              <span>Username</span>
              <input value={username} onChange={(event) => setUsername(event.target.value)} required />
            </label>
            <button className="button button-primary" disabled={busy}>
              {busy ? 'Saving…' : 'Save changes'}
              <Check size={15} />
            </button>
          </form>
        )}

        <div className="profile-details">
          <div><span>Email address</span><b>{profileEmail}</b></div>
          <div><span>Institution</span><b>{profileUniversity}</b></div>
          <div><span>Programme</span><b>{profileProgram}</b></div>
          <div><span>Year of study</span><b>{profileYear ? `Year ${profileYear}` : 'Not added yet'}</b></div>
        </div>

        <div className="profile-stats-row">
          <div><BookOpen size={16} /><b>{String(profileStats.totalCourses ?? '—')}</b><span>Courses</span></div>
          <div><BookOpenCheck size={16} /><b>{String(profileStats.totalQuizzes ?? '—')}</b><span>Quizzes</span></div>
          <div><Flame size={16} /><b>{String(profileStats.currentStreak ?? '—')}</b><span>Day streak</span></div>
        </div>

        <div className="profile-xp-card">
          <span className="profile-xp-icon"><Trophy size={20} /></span>
          <div>
            <b>{profileStats.level != null ? `Level ${String(profileStats.level)}` : 'Level unavailable'}</b>
            <span>
              {profileStats.totalXp != null ? `${Number(profileStats.totalXp).toLocaleString()} XP earned` : 'XP unavailable'}
              <i> · </i>
              {profileStats.studyHours != null ? `${formatStudyHours(Number(profileStats.studyHours))} study time` : 'Study time unavailable'}
            </span>
          </div>
        </div>

        <Link className="profile-academic-link" to="/onboarding/academic-setup">
          <GraduationCap size={16} /> Update academic details <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}
