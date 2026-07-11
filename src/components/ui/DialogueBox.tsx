import { useState } from 'react';
import { CharacterPortrait, speakerName, type SpeakerId } from '@/components/characters/CharacterPortrait';

export type Line = { speaker: SpeakerId; text: string };

type Props = {
  script: Line[];
  teamName?: string;
  reducedMotion: boolean;
  onDone: () => void;
  doneLabel?: string;
};

// Visual-novel style dialogue: one short line at a time with the speaker's
// portrait. Tap anywhere to advance. Turns walls of text into a paced,
// characterful conversation (addresses "too much reading").
export function DialogueBox({ script, teamName, reducedMotion, onDone, doneLabel = 'Continue' }: Props) {
  const [i, setI] = useState(0);
  const line = script[i];
  const isLast = i >= script.length - 1;

  function advance() {
    if (isLast) onDone();
    else setI((n) => n + 1);
  }

  if (!line) {
    return null;
  }

  return (
    <button
      onClick={advance}
      aria-label={isLast ? doneLabel : 'Next line'}
      className="w-full text-left"
    >
      <div className="flex flex-col items-center gap-2">
        <div style={{ animation: reducedMotion ? undefined : 'slideUp 0.25s ease' }} key={`p-${i}`}>
          <CharacterPortrait id={line.speaker} animate={!reducedMotion} size={96} />
        </div>
        <div
          key={`b-${i}`}
          className="w-full cartoon-border rounded-2xl bg-[var(--color-cloud)] p-4"
          style={{ animation: reducedMotion ? undefined : 'slideUp 0.25s ease' }}
        >
          <div className="text-sm font-bold mb-1" style={{ color: 'var(--color-plumeria-violet)' }}>
            {speakerName(line.speaker, teamName)}
          </div>
          <p className="leading-relaxed">{line.text}</p>
          <div className="mt-3 flex items-center justify-between text-xs" style={{ opacity: 0.6 }}>
            <span>{i + 1} / {script.length}</span>
            <span className="font-bold">{isLast ? `${doneLabel} ▸` : 'Tap to continue ▸'}</span>
          </div>
        </div>
      </div>
    </button>
  );
}
