import React, { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';

export const DesignSystemPage: React.FC = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-display text-3xl font-bold mb-4">PlantLady Design System</h1>
          <p className="text-[var(--color-text-2)] mb-6">
            Comprehensive design tokens and component library for the PlantLady App
          </p>
          <Button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            variant="secondary"
          >
            Toggle Theme ({theme})
          </Button>
        </div>

        {/* Typography */}
        <section className="mb-16">
          <h2 className="font-display text-2xl font-bold mb-6">Typography</h2>
          <Card className="p-8 space-y-6">
            <div>
              <p className="text-xs text-[var(--color-text-muted)] mb-2">Display / 40px</p>
              <h1 className="font-display text-3xl font-bold">Cormorant Garamond</h1>
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)] mb-2">Display / 30px</p>
              <h2 className="font-display text-2xl font-bold">Graceful Botanical Headlines</h2>
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)] mb-2">Display / 22px</p>
              <h3 className="font-display text-xl font-bold">Section Headings</h3>
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)] mb-2">Body / 16px</p>
              <p className="font-body text-base">
                DM Sans is used for all body text, UI elements, and interactive components. It's modern and highly readable at all sizes.
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)] mb-2">Body / 14px</p>
              <p className="font-body text-sm">
                Smaller text for captions, metadata, and secondary information.
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)] mb-2">Body / 12px</p>
              <p className="font-body text-xs">
                Tiny text for labels, timestamps, and help text.
              </p>
            </div>
          </Card>
        </section>

        {/* Colors - Dark Mode */}
        {theme === 'dark' && (
          <section className="mb-16">
            <h2 className="font-display text-2xl font-bold mb-6">Dark Mode Colors</h2>

            {/* Backgrounds */}
            <div className="mb-8">
              <h3 className="font-display text-xl font-bold mb-4">Backgrounds</h3>
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-6 bg-[var(--color-bg)]">
                  <p className="text-xs text-[var(--color-text-muted)] mb-2">#1A140E</p>
                  <p className="font-body text-sm text-[var(--color-text)]">--color-bg</p>
                </Card>
                <Card className="p-6 bg-[var(--color-surface)]">
                  <p className="text-xs text-[var(--color-text-muted)] mb-2">#2C1F14</p>
                  <p className="font-body text-sm text-[var(--color-text)]">--color-surface</p>
                </Card>
                <Card className="p-6 bg-[var(--color-surface-2)]">
                  <p className="text-xs text-[var(--color-text-muted)] mb-2">#3D2B1A</p>
                  <p className="font-body text-sm text-[var(--color-text)]">--color-surface-2</p>
                </Card>
                <Card className="p-6 bg-[var(--color-surface-3)]">
                  <p className="text-xs text-[var(--color-text-muted)] mb-2">#4E3722</p>
                  <p className="font-body text-sm text-[var(--color-text)]">--color-surface-3</p>
                </Card>
              </div>
            </div>

            {/* Brand Colors */}
            <div className="mb-8">
              <h3 className="font-display text-xl font-bold mb-4">Brand Colors</h3>
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-6 bg-brand-terracotta">
                  <p className="text-xs text-white opacity-75 mb-2">#C4613A</p>
                  <p className="font-body text-sm text-white">Terracotta</p>
                </Card>
                <Card className="p-6 bg-brand-terracotta-light">
                  <p className="text-xs text-[var(--color-text)] opacity-75 mb-2">#E07A52</p>
                  <p className="font-body text-sm text-[var(--color-text)]">Terracotta Light</p>
                </Card>
                <Card className="p-6 bg-brand-sage">
                  <p className="text-xs text-white opacity-75 mb-2">#7A9E7E</p>
                  <p className="font-body text-sm text-white">Sage</p>
                </Card>
                <Card className="p-6 bg-brand-gold">
                  <p className="text-xs text-[var(--color-text)] opacity-75 mb-2">#D4A85C</p>
                  <p className="font-body text-sm text-[var(--color-text)]">Gold</p>
                </Card>
              </div>
            </div>

            {/* Text Colors */}
            <div className="mb-8">
              <h3 className="font-display text-xl font-bold mb-4">Text Colors</h3>
              <div className="space-y-2">
                <p className="font-body text-base text-[var(--color-text)]">
                  Primary text: #F5EED8 (--color-text)
                </p>
                <p className="font-body text-base text-[var(--color-text-2)]">
                  Secondary text: #C4B49A (--color-text-2)
                </p>
                <p className="font-body text-base text-[var(--color-text-muted)]">
                  Muted text: #8A7B6B (--color-text-muted)
                </p>
              </div>
            </div>

            {/* Semantic Colors */}
            <div className="mb-8">
              <h3 className="font-display text-xl font-bold mb-4">Semantic Colors</h3>
              <div className="grid grid-cols-3 gap-4">
                <Card className="p-6">
                  <div className="w-full h-12 bg-semantic-success rounded-md mb-3"></div>
                  <p className="font-body text-sm text-[var(--color-text)]">Success #7BC47A</p>
                </Card>
                <Card className="p-6">
                  <div className="w-full h-12 bg-semantic-error rounded-md mb-3"></div>
                  <p className="font-body text-sm text-[var(--color-text)]">Error #E05555</p>
                </Card>
                <Card className="p-6">
                  <div className="w-full h-12 bg-semantic-warning rounded-md mb-3"></div>
                  <p className="font-body text-sm text-[var(--color-text)]">Warning #D4A85C</p>
                </Card>
              </div>
            </div>
          </section>
        )}

        {/* Colors - Light Mode */}
        {theme === 'light' && (
          <section className="mb-16">
            <h2 className="font-display text-2xl font-bold mb-6">Light Mode Colors</h2>

            <div className="mb-8">
              <h3 className="font-display text-xl font-bold mb-4">Backgrounds</h3>
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-6 border-2 border-[var(--color-border-strong)]" variant="elevated">
                  <p className="text-xs text-[var(--color-text-muted)] mb-2">#FAF6F0</p>
                  <p className="font-body text-sm text-[var(--color-text)]">--color-bg</p>
                </Card>
                <Card className="p-6">
                  <p className="text-xs text-[var(--color-text-muted)] mb-2">#FFFFFF</p>
                  <p className="font-body text-sm text-[var(--color-text)]">--color-surface</p>
                </Card>
              </div>
            </div>
          </section>
        )}

        {/* Components */}
        <section className="mb-16">
          <h2 className="font-display text-2xl font-bold mb-6">Components</h2>

          {/* Buttons */}
          <div className="mb-12">
            <h3 className="font-display text-xl font-bold mb-4">Buttons</h3>
            <Card className="p-8">
              <div className="space-y-6">
                {/* Primary */}
                <div>
                  <p className="text-xs text-[var(--color-text-muted)] mb-3">Primary Variant</p>
                  <div className="flex gap-4 flex-wrap">
                    <Button size="sm">Small Button</Button>
                    <Button size="md">Medium Button</Button>
                    <Button size="lg">Large Button</Button>
                  </div>
                </div>

                {/* Secondary */}
                <div>
                  <p className="text-xs text-[var(--color-text-muted)] mb-3">Secondary Variant</p>
                  <div className="flex gap-4 flex-wrap">
                    <Button variant="secondary" size="sm">Small</Button>
                    <Button variant="secondary" size="md">Medium</Button>
                    <Button variant="secondary" size="lg">Large</Button>
                  </div>
                </div>

                {/* Accent */}
                <div>
                  <p className="text-xs text-[var(--color-text-muted)] mb-3">Accent Variant</p>
                  <div className="flex gap-4 flex-wrap">
                    <Button variant="accent" size="sm">Small</Button>
                    <Button variant="accent" size="md">Medium</Button>
                    <Button variant="accent" size="lg">Large</Button>
                  </div>
                </div>

                {/* Ghost */}
                <div>
                  <p className="text-xs text-[var(--color-text-muted)] mb-3">Ghost Variant</p>
                  <div className="flex gap-4 flex-wrap">
                    <Button variant="ghost" size="sm">Small</Button>
                    <Button variant="ghost" size="md">Medium</Button>
                    <Button variant="ghost" size="lg">Large</Button>
                  </div>
                </div>

                {/* Full Width */}
                <div>
                  <p className="text-xs text-[var(--color-text-muted)] mb-3">Full Width</p>
                  <Button fullWidth>Full Width Button</Button>
                </div>

                {/* Disabled */}
                <div>
                  <p className="text-xs text-[var(--color-text-muted)] mb-3">Disabled State</p>
                  <Button disabled>Disabled Button</Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Badges */}
          <div className="mb-12">
            <h3 className="font-display text-xl font-bold mb-4">Badges</h3>
            <Card className="p-8">
              <div className="space-y-6">
                <div>
                  <p className="text-xs text-[var(--color-text-muted)] mb-3">Care Urgency Indicators</p>
                  <div className="flex gap-3 flex-wrap">
                    <Badge variant="error">🔴 Overdue 2 days</Badge>
                    <Badge variant="warning">🟡 Due today</Badge>
                    <Badge variant="success">🟢 Healthy</Badge>
                    <Badge variant="info">📅 Due in 3d</Badge>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-text-muted)] mb-3">Small Size</p>
                  <div className="flex gap-3 flex-wrap">
                    <Badge variant="success" size="sm">Success</Badge>
                    <Badge variant="error" size="sm">Error</Badge>
                    <Badge variant="warning" size="sm">Warning</Badge>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Cards */}
          <div>
            <h3 className="font-display text-xl font-bold mb-4">Cards</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h4 className="font-display text-lg font-bold mb-2">Default Card</h4>
                <p className="font-body text-sm text-[var(--color-text-2)]">
                  Standard card surface with subtle border
                </p>
              </Card>
              <Card className="p-6" variant="elevated">
                <h4 className="font-display text-lg font-bold mb-2">Elevated Card</h4>
                <p className="font-body text-sm text-[var(--color-text-2)]">
                  Elevated card with shadow and stronger border
                </p>
              </Card>
              <Card className="p-6" hoverable>
                <h4 className="font-display text-lg font-bold mb-2">Hoverable Card</h4>
                <p className="font-body text-sm text-[var(--color-text-2)]">
                  Hover over me to see the lift effect
                </p>
              </Card>
              <Card className="p-6">
                <div className="w-full h-24 bg-gradient-to-br from-brand-terracotta to-brand-sage rounded-md mb-4"></div>
                <h4 className="font-display text-lg font-bold mb-2">Plant Card Example</h4>
                <p className="font-body text-sm text-[var(--color-text-2)] mb-3">
                  Monstera Deliciosa
                </p>
                <Badge variant="warning">💧 Due today</Badge>
              </Card>
            </div>
          </div>
        </section>

        {/* Spacing */}
        <section className="mb-16">
          <h2 className="font-display text-2xl font-bold mb-6">Spacing Scale</h2>
          <Card className="p-8">
            <p className="text-xs text-[var(--color-text-muted)] mb-6">
              Base unit: 4px
            </p>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5, 6, 8, 10].map((size) => (
                <div key={size} className="flex items-center gap-4">
                  <div style={{ width: `${size * 4}px`, height: '20px' }} className="bg-brand-terracotta rounded"></div>
                  <span className="font-body text-sm text-[var(--color-text-2)]">
                    space-{size}: {size * 4}px
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* Border Radius */}
        <section>
          <h2 className="font-display text-2xl font-bold mb-6">Border Radius</h2>
          <Card className="p-8">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="w-20 h-20 bg-brand-terracotta rounded-sm mx-auto mb-3"></div>
                <p className="font-body text-xs">sm: 8px</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-brand-terracotta rounded-md mx-auto mb-3"></div>
                <p className="font-body text-xs">md: 12px</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-brand-terracotta rounded-lg mx-auto mb-3"></div>
                <p className="font-body text-xs">lg: 16px</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-brand-terracotta rounded-xl mx-auto mb-3"></div>
                <p className="font-body text-xs">xl: 20px</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-brand-terracotta rounded-full mx-auto mb-3"></div>
                <p className="font-body text-xs">full</p>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
};
