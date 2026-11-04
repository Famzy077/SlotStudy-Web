import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import api, { getErrorMessage } from '../../../lib/api';
import { useAuth } from '../../../lib/auth';
import { useApiQuery, getPath } from '../../../hooks/useApiQuery';
import { PageTitle, QueryNotice, LoadingLine, EmptyState } from '../../../components/common';
import type { DataObject } from '../../../types';

export function SettingsPage() {
  const result = useApiQuery<DataObject>('settings', '/settings');
  const [theme, setTheme] = useState(localStorage.getItem('slotstudy-theme') || 'system');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [notifications, setNotifications] = useState({
    pushEnabled: false,
    emailEnabled: true,
    studyReminders: true,
    reminderTime: '19:00',
  });
  const [autoPlay, setAutoPlay] = useState(false);

  useEffect(() => {
    if (!result.data) return;
    const savedTheme = String(getPath(result.data, 'preferences.theme', theme));
    const savedNotifications = getPath(result.data, 'notifications');
    setTheme(savedTheme);
    setNotifications((current) => ({ ...current, ...(savedNotifications as Partial<typeof current>) }));
    setAutoPlay(Boolean(getPath(result.data, 'preferences.autoPlay', false)));
    window.dispatchEvent(new CustomEvent('slotstudy-theme-change', { detail: savedTheme }));
  }, [result.data]);

  async function saveSettings() {
    setBusy(true);
    setMessage('');
    try {
      await api.patch('/settings', { notifications, preferences: { theme, autoPlay } });
      localStorage.setItem('slotstudy-theme', theme);
      window.dispatchEvent(new CustomEvent('slotstudy-theme-change', { detail: theme }));
      setMessage('Your preferences have been saved.');
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function deleteAccount() {
    if (!window.confirm('Permanently delete your account and study data? This cannot be undone.')) return;
    try {
      await api.delete('/settings/account');
      useAuth.getState().logout();
      window.location.assign('/');
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  }

  return (
    <div className="narrow-page">
      <PageTitle
        eyebrow="MAKE IT FEEL LIKE YOURS"
        title="Settings"
        subtitle="Set up your study space the way you like it."
      />
      <QueryNotice error={result.error} />

      {result.data ? (
        <>
          <section className="settings-card">
            <span className="eyebrow">APPEARANCE</span>
            <h3>A comfortable place to focus</h3>
            <p>Choose how SlotStudy looks on this device.</p>
            <div className="theme-choices">
              {['light', 'dark', 'system'].map((choice) => (
                <button
                  key={choice}
                  onClick={() => {
                    setTheme(choice);
                    window.dispatchEvent(new CustomEvent('slotstudy-theme-change', { detail: choice }));
                  }}
                  className={theme === choice ? 'theme-choice theme-choice-selected' : 'theme-choice'}
                >
                  {choice === 'light' ? '☼' : choice === 'dark' ? '☾' : '◐'}
                  <span>{choice[0].toUpperCase() + choice.slice(1)}</span>
                  {theme === choice && <Check size={15} />}
                </button>
              ))}
            </div>
          </section>

          <section className="settings-card">
            <span className="eyebrow">YOUR STUDY RHYTHM</span>
            <h3>Reminders and preferences</h3>
            <p>Choose how we can help you keep a steady learning rhythm.</p>
            <label className="setting-toggle">
              <span>
                <b>Study reminders</b>
                <small>Get a gentle nudge to make time for learning.</small>
              </span>
              <input
                type="checkbox"
                checked={notifications.studyReminders}
                onChange={(event) => setNotifications((value) => ({ ...value, studyReminders: event.target.checked }))}
              />
            </label>
            <label className="setting-toggle">
              <span>
                <b>Email notifications</b>
                <small>Receive important study updates by email.</small>
              </span>
              <input
                type="checkbox"
                checked={notifications.emailEnabled}
                onChange={(event) => setNotifications((value) => ({ ...value, emailEnabled: event.target.checked }))}
              />
            </label>
            <label className="setting-toggle">
              <span>
                <b>Push notifications</b>
                <small>Allow reminders on this device.</small>
              </span>
              <input
                type="checkbox"
                checked={notifications.pushEnabled}
                onChange={(event) => setNotifications((value) => ({ ...value, pushEnabled: event.target.checked }))}
              />
            </label>
            <label className="form-field reminder-time">
              <span>Preferred reminder time</span>
              <input
                type="time"
                value={notifications.reminderTime}
                onChange={(event) => setNotifications((value) => ({ ...value, reminderTime: event.target.value }))}
              />
            </label>
            <label className="setting-toggle">
              <span>
                <b>Auto-play read aloud</b>
                <small>Play voice narration when opening a summary.</small>
              </span>
              <input
                type="checkbox"
                checked={autoPlay}
                onChange={(event) => setAutoPlay(event.target.checked)}
              />
            </label>
            <button className="button button-primary settings-save" onClick={saveSettings} disabled={busy}>
              {busy ? 'Saving…' : 'Save preferences'}
              <Check size={15} />
            </button>
            {message && (
              <div className={message.includes('saved') ? 'success-alert' : 'form-alert'}>
                {message}
              </div>
            )}
          </section>
        </>
      ) : result.isLoading ? (
        <LoadingLine />
      ) : (
        <EmptyState title="Settings unavailable" detail="Your saved preferences could not be loaded." />
      )}

      <section className="settings-card danger-card">
        <span className="eyebrow">DANGER ZONE</span>
        <h3>Delete your account</h3>
        <p>Deleting your account permanently removes your personal study data.</p>
        <button className="button button-danger" onClick={deleteAccount}>
          Delete account permanently
        </button>
      </section>
    </div>
  );
}
