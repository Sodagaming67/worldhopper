import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export function OfflineStatusPill() {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-2 left-1/2 -translate-x-1/2 z-50 px-4 py-1 rounded-full text-sm font-semibold"
      style={{ background: 'var(--color-sun-gold)', color: 'var(--color-ink)' }}
    >
      Playing offline — progress saves locally
    </div>
  );
}
