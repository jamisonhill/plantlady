import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [careReminders, setCareReminders] = useState(true);

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme === 'system' ? 'dark' : theme);
  }, [theme]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] pb-[100px]">
      <div className="p-4 max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-[var(--color-text)] hover:text-brand-terracotta mb-4"
          >
            ← Back
          </button>
          <h1 className="font-display text-2xl font-bold">Settings</h1>
        </div>

        {/* Account Settings */}
        <section className="mb-8">
          <h2 className="font-display text-lg font-bold text-[var(--color-text)] mb-4">
            Account
          </h2>

          <Card className="p-4 mb-3">
            <p className="text-xs text-[var(--color-text-muted)] mb-2">
              Name
            </p>
            <p className="font-body font-medium text-[var(--color-text)]">
              {currentUser?.name || 'User'}
            </p>
          </Card>

          <Card className="p-4 mb-3">
            <p className="text-xs text-[var(--color-text-muted)] mb-2">
              User ID
            </p>
            <p className="font-body font-medium text-[var(--color-text)]">
              #{currentUser?.id}
            </p>
          </Card>

          <div className="space-y-2">
            <Button variant="secondary" fullWidth>
              ✏️ Edit Profile
            </Button>
            <Button variant="ghost" fullWidth>
              🔐 Change PIN
            </Button>
          </div>
        </section>

        {/* Theme Settings */}
        <section className="mb-8">
          <h2 className="font-display text-lg font-bold text-[var(--color-text)] mb-4">
            Appearance
          </h2>

          <Card className="p-4">
            <p className="text-sm font-body font-medium text-[var(--color-text)] mb-3">
              Theme
            </p>
            <div className="space-y-2">
              {(['dark', 'light', 'system'] as const).map((t) => (
                <label key={t} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="theme"
                    value={t}
                    checked={theme === t}
                    onChange={() => setTheme(t)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-body text-[var(--color-text)] capitalize">
                    {t === 'dark' ? '🌙 Dark' : t === 'light' ? '☀️ Light' : '⚙️ System'}
                  </span>
                </label>
              ))}
            </div>
          </Card>
        </section>

        {/* Notification Settings */}
        <section className="mb-8">
          <h2 className="font-display text-lg font-bold text-[var(--color-text)] mb-4">
            Notifications
          </h2>

          <Card className="p-4 space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-body font-medium text-[var(--color-text)]">
                Push Notifications
              </span>
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
                className="w-5 h-5"
              />
            </label>

            <div className="pt-4 border-t border-[var(--color-border)]">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm font-body font-medium text-[var(--color-text)]">
                  Care Reminders
                </span>
                <input
                  type="checkbox"
                  checked={careReminders}
                  onChange={(e) => setCareReminders(e.target.checked)}
                  disabled={!notificationsEnabled}
                  className="w-5 h-5"
                />
              </label>
              <p className="text-xs text-[var(--color-text-muted)] mt-2">
                Get notified when your plants need care
              </p>
            </div>

            <div className="pt-4 border-t border-[var(--color-border)]">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm font-body font-medium text-[var(--color-text)]">
                  Friend Activity
                </span>
                <input
                  type="checkbox"
                  disabled={!notificationsEnabled}
                  defaultChecked={true}
                  className="w-5 h-5"
                />
              </label>
              <p className="text-xs text-[var(--color-text-muted)] mt-2">
                See when friends log care or add new plants
              </p>
            </div>
          </Card>
        </section>

        {/* Privacy Settings */}
        <section className="mb-8">
          <h2 className="font-display text-lg font-bold text-[var(--color-text)] mb-4">
            Privacy
          </h2>

          <Card className="p-4">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-body font-medium text-[var(--color-text)]">
                Profile Public
              </span>
              <input
                type="checkbox"
                defaultChecked={false}
                className="w-5 h-5"
              />
            </label>
            <p className="text-xs text-[var(--color-text-muted)] mt-2">
              Let anyone discover your profile and plants
            </p>
          </Card>
        </section>

        {/* About */}
        <section className="mb-8">
          <h2 className="font-display text-lg font-bold text-[var(--color-text)] mb-4">
            About
          </h2>

          <Card className="p-4 space-y-3 text-sm">
            <div>
              <p className="text-xs text-[var(--color-text-muted)] mb-1">
                Version
              </p>
              <p className="font-body text-[var(--color-text)]">1.0.0</p>
            </div>

            <div className="pt-3 border-t border-[var(--color-border)]">
              <p className="text-xs text-[var(--color-text-muted)] mb-1">
                Last Updated
              </p>
              <p className="font-body text-[var(--color-text)]">Feb 26, 2026</p>
            </div>
          </Card>
        </section>

        {/* Logout */}
        <div className="space-y-2">
          <Button variant="ghost" fullWidth>
            📧 Contact Support
          </Button>
          <Button
            variant="ghost"
            fullWidth
            onClick={handleLogout}
            className="text-semantic-error border-semantic-error hover:bg-semantic-error/10"
          >
            🚪 Log Out
          </Button>
        </div>
      </div>
    </div>
  );
};
