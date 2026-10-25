import type { ReactNode } from 'react';
import { Pause, Play, RotateCcw, SkipForward } from 'lucide-react';
import { cn } from '../../lib/utils';
import { HERO_BEATS } from '../../data/botShowcase';
import type { usePresenter } from '../../hooks/usePresenter';

/* Play / Step / Restart under the stage, for presenting in a meeting, with the current moment's time and caption. */

type Presenter = ReturnType<typeof usePresenter>;

export default function Controls({ p }: { p: Presenter }) {
  const beat = HERO_BEATS[p.index];
  return (
    <div className="mt-6 flex flex-col items-center gap-2">
      <div className="flex items-center gap-1 rounded-full bg-white p-1 shadow-[0_1px_3px_rgba(0,0,0,0.08)] ring-1 ring-black/[0.05]">
        <Ctrl onClick={p.toggle} label={p.playing ? 'Pause' : 'Play'}>{p.playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}</Ctrl>
        <span className="flex items-center gap-1 px-2" aria-hidden="true">
          {HERO_BEATS.map((_, i) => (
            <span key={i} className={cn('h-1.5 rounded-full transition-all duration-300', i === p.index ? 'w-5 bg-black' : i < p.index ? 'w-1.5 bg-black/40' : 'w-1.5 bg-black/10')} />
          ))}
        </span>
        <Ctrl onClick={p.step} label="Next step (→)"><SkipForward className="h-4 w-4" /></Ctrl>
        <Ctrl onClick={p.restart} label="Restart"><RotateCcw className="h-4 w-4" /></Ctrl>
      </div>
      <p className="text-[13px] text-black/45"><span className="tabular-nums text-black/80">{beat.time}</span> · {beat.caption}</p>
    </div>
  );
}

function Ctrl({ onClick, label, children }: { onClick: () => void; label: string; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid h-8 w-8 place-items-center rounded-full text-black/80 transition-colors hover:bg-black/[0.05] hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/60"
    >
      {children}
    </button>
  );
}
