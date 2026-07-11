import type { ReactNode } from 'react';
import { OfflineStatusPill } from './OfflineStatusPill';

type Props = { children: ReactNode };

export function AppShell({ children }: Props) {
  return (
    <div className="flex flex-col min-h-svh max-w-2xl mx-auto relative">
      <OfflineStatusPill />
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}
