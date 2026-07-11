import { useState, useMemo } from 'react';
import { Button } from './Button';
import { Card } from './Card';

type Props = {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
};

// A soft "are you a grown-up?" gate before destructive actions (spec §10/§12).
// Not real security — just a small friction step a young child won't breeze past.
export function ParentGate({ title, message, confirmLabel, onConfirm, onCancel }: Props) {
  const [a] = useState(() => 3 + Math.floor(Math.random() * 6));
  const [b] = useState(() => 2 + Math.floor(Math.random() * 6));
  const [answer, setAnswer] = useState('');
  const correct = useMemo(() => a + b, [a, b]);
  const ok = Number(answer) === correct;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(23,50,58,0.55)' }}>
      <div className="w-full max-w-sm">
        <Card accent="var(--color-coral)">
          <h2 className="text-xl mb-1" style={{ color: 'var(--color-ocean-deep)' }}>{title}</h2>
          <p className="text-sm mb-3">{message}</p>
          <label className="block text-sm font-bold mb-1" htmlFor="parent-gate">
            Grown-up check: what is {a} + {b}?
          </label>
          <input
            id="parent-gate"
            inputMode="numeric"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full cartoon-border rounded-lg px-3 py-2 bg-[var(--color-sand)] mb-3"
          />
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onCancel} fullWidth>Cancel</Button>
            <Button onClick={onConfirm} disabled={!ok} fullWidth>{confirmLabel}</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
