import { useState } from 'react';
import { MotionConfig } from 'motion/react';
import { cn } from '../lib/utils';
import Hero from '../components/bot-showcase/Hero';

/* Site Bot showcase: a single hero. To add it to the firstbriq frontend, copy components/bot-showcase,
   data/botShowcase.ts and hooks/usePresenter.ts, then add <Route path="/site-bot" element={<BotShowcase />} /> in App.tsx. */

type Design = 'a' | 'b' | 'c';
const LABEL: Record<Design, string> = { a: ' · Side by side', b: ' · Phone at the centre', c: ' · Scroll story' };
const fromUrl = (): Design => {
  const d = new URLSearchParams(window.location.search).get('design');
  return d === 'b' || d === 'c' ? d : 'a';
};

export default function BotShowcase() {
  const [design, setDesign] = useState<Design>(fromUrl);

  const pick = (d: Design) => {
    setDesign(d);
    /* keep the choice in the address, so a link opens the same design */
    const url = new URL(window.location.href);
    if (d === 'a') url.searchParams.delete('design'); else url.searchParams.set('design', d);
    window.history.replaceState(null, '', url);
  };

  return (
    <MotionConfig reducedMotion="user">
      <main>
        <Hero key={design} design={design} />
      </main>
      <DesignSwitch design={design} onPick={pick} />
    </MotionConfig>
  );
}

/* For review only: switch between the stage designs. Remove before moving the page into the frontend. */
function DesignSwitch({ design, onPick }: { design: Design; onPick: (d: Design) => void }) {
  return (
    <div className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full bg-black p-1 pl-4 font-display text-[13px] text-white shadow-[0_12px_30px_-10px_rgba(0,0,0,0.5)]">
      <span className="mr-2 text-white/60">Design</span>
      {(['a', 'b', 'c'] as const).map(d => (
        <button
          key={d}
          type="button"
          onClick={() => onPick(d)}
          aria-pressed={design === d}
          className={cn('h-8 whitespace-nowrap rounded-full px-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70', design === d ? 'bg-white text-black' : 'text-white/80 hover:bg-white/10')}
        >
          {d.toUpperCase()}
          <span className="hidden sm:inline">{LABEL[d]}</span>
        </button>
      ))}
    </div>
  );
}
