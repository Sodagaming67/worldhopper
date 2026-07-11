import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
  accent?: string; // CSS color for a left accent bar
};

export function Card({ children, className = '', accent }: Props) {
  return (
    <div
      className={`cartoon-border bg-[var(--color-cloud)] p-4 ${className}`}
      style={accent ? { borderLeftWidth: 8, borderLeftColor: accent } : undefined}
    >
      {children}
    </div>
  );
}

type ScreenHeaderProps = {
  title: string;
  onBack?: () => void;
  right?: ReactNode;
};

export function ScreenHeader({ title, onBack, right }: ScreenHeaderProps) {
  return (
    <header className="flex items-center gap-2 px-4 py-3 sticky top-0 z-10 bg-[var(--color-sand)]">
      {onBack && (
        <button
          onClick={onBack}
          aria-label="Go back"
          className="tap-target cartoon-border cartoon-shadow-hover rounded-xl bg-[var(--color-cloud)]"
        >
          {/* inline chevron to avoid an Icon import cycle in headers */}
          <span aria-hidden style={{ fontSize: 20, lineHeight: 1 }}>‹</span>
        </button>
      )}
      <h1 className="text-2xl flex-1" style={{ color: 'var(--color-ocean-deep)' }}>{title}</h1>
      {right}
    </header>
  );
}
