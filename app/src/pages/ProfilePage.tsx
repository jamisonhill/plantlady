import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

export const ProfilePage: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [shareSettings, setShareSettings] = useState({
    shareWithAmy: true,
    shareWithMarcus: false,
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] pb-[100px]">
      <div className="p-4 max-w-lg mx-auto">
        {/* User Header */}
        <Card variant="elevated" className="p-6 mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="font-display text-2xl font-bold mb-1">
                {currentUser?.name || 'User'}
              </h1>
              <p className="text-[var(--color-text-2)] text-sm">
                @plantlover_{currentUser?.id || '0'}
              </p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-brand-terracotta to-brand-sage rounded-full flex items-center justify-center text-white font-bold text-lg">
              {currentUser?.name?.charAt(0) || 'U'}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[var(--color-border)]">
            <div className="text-center">
              <p className="text-sm text-[var(--color-text-muted)]">🌿 Plants</p>
              <p className="font-display text-xl font-bold">14</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-[var(--color-text-muted)]">🔥 Streak</p>
              <p className="font-display text-xl font-bold">12</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-[var(--color-text-muted)]">💧 Tasks</p>
              <p className="font-display text-xl font-bold">47</p>
            </div>
          </div>
        </Card>

        {/* Social Section */}
        <section className="mb-8">
          <h2 className="font-display text-lg font-bold text-[var(--color-text)] mb-4">
            👥 Social
          </h2>

          <Card
            className="p-4 mb-3 cursor-pointer hover:bg-[var(--color-surface-2)] transition-colors"
            onClick={() => navigate('/friends')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-body font-medium text-[var(--color-text)]">
                  My Friends
                </p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  2 friends
                </p>
              </div>
              <span>→</span>
            </div>
          </Card>

          <Card
            className="p-4 cursor-pointer hover:bg-[var(--color-surface-2)] transition-colors"
            onClick={() => navigate('/activity-feed')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-body font-medium text-[var(--color-text)]">
                  Activity Feed
                </p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  See friends' activities
                </p>
              </div>
              <span>→</span>
            </div>
          </Card>
        </section>

        {/* Sharing Settings */}
        <section className="mb-8">
          <h2 className="font-display text-lg font-bold text-[var(--color-text)] mb-4">
            🔗 Sharing
          </h2>

          <Card variant="elevated" className="p-4 space-y-4">
            <p className="text-sm text-[var(--color-text-2)]">
              Choose which friends can see your activity:
            </p>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-body font-medium text-[var(--color-text)]">
                Share with Amy
              </span>
              <input
                type="checkbox"
                checked={shareSettings.shareWithAmy}
                onChange={(e) =>
                  setShareSettings({
                    ...shareSettings,
                    shareWithAmy: e.target.checked,
                  })
                }
                className="w-5 h-5"
              />
            </label>

            <div className="pt-3 border-t border-[var(--color-border)]">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm font-body font-medium text-[var(--color-text)]">
                  Share with Marcus
                </span>
                <input
                  type="checkbox"
                  checked={shareSettings.shareWithMarcus}
                  onChange={(e) =>
                    setShareSettings({
                      ...shareSettings,
                      shareWithMarcus: e.target.checked,
                    })
                  }
                  className="w-5 h-5"
                />
              </label>
            </div>
          </Card>
        </section>

        {/* Settings Section */}
        <section className="mb-8">
          <h2 className="font-display text-lg font-bold text-[var(--color-text)] mb-4">
            ⚙️ Settings
          </h2>

          <Card
            className="p-4 cursor-pointer hover:bg-[var(--color-surface-2)] transition-colors"
            onClick={() => navigate('/settings')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-body font-medium text-[var(--color-text)]">
                  Account & Preferences
                </p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  Theme, notifications, privacy
                </p>
              </div>
              <span>→</span>
            </div>
          </Card>
        </section>

        {/* About Section */}
        <section className="mb-8">
          <Card className="p-4 bg-brand-terracotta/10">
            <p className="font-body font-medium text-sm text-[var(--color-text)] mb-2">
              🌿 PlantLady
            </p>
            <p className="text-xs text-[var(--color-text-2)]">
              Version 1.0.0 • Built with care for plant lovers
            </p>
          </Card>
        </section>

        {/* Logout */}
        <div>
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
