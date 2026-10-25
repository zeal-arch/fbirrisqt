import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { AlertCircle, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import { HERO_BEATS, booksFrom } from '../../data/botShowcase';
import type { usePresenter } from '../../hooks/usePresenter';
import Phone from './Phone';
import CrmWindow from './CrmWindow';
import Backdrop from './Backdrop';
import { buildFeed } from './BooksFeed';

/* Design C: a scroll story. The phone and the CRM stay pinned while the visitor scrolls; each scroll step is one
   moment of the day, with a short line saying what Site Bot did and what it checked. The visitor sets the pace,
   so no moment is missed. Same scripted day as A and B. */

type Presenter = ReturnType<typeof usePresenter>;
const noop = () => {};

/* Phone and CrmWindow read the day through a presenter; here it simply stands at the end of the step in view. */
function presenterAt(step: number): Presenter {
  return {
    index: step,
    phase: 'done',
    playing: false,
    finished: step === HERO_BEATS.length - 1,
    toggle: noop,
    step: noop,
    restart: noop,
    reached: (i: number) => i <= step,
    checksShown: (i: number) => (i <= step ? HERO_BEATS[i].checks.length : 0),
  };
}

export default function StageC() {
  const [step, setStep] = useState(0);
  const [wide] = useState(() => window.matchMedia('(min-width: 1024px)').matches);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  /* The step crossing the reading line becomes the current one. On phones the pinned phone covers the top
     of the screen, so the line sits lower there. */
  useEffect(() => {
    const io = new IntersectionObserver(
      entries => {
        for (const e of entries) if (e.isIntersecting) setStep(Number((e.target as HTMLElement).dataset.step));
      },
      { rootMargin: wide ? '-50% 0px -50% 0px' : '-75% 0px -20% 0px' },
    );
    stepRefs.current.forEach(el => el && io.observe(el));
    return () => io.disconnect();
  }, [wide]);

  const p = useMemo(() => presenterAt(step), [step]);
  const feed = useMemo(() => buildFeed(i => i <= step), [step]);
  const books = useMemo(() => booksFrom(HERO_BEATS.slice(0, step + 1)), [step]);
  const posted = books.rows.filter(r => r.status === 'posted').reduce((a, r) => a + r.amount, 0);
  const bills = books.rows.filter(r => r.status === 'claimed').length;

  return (
    <div role="region" aria-label="Example: Site Bot reading one day in a site WhatsApp group, step by step" className="relative text-left">
      {/* the backdrop is clipped on its own layer: an overflow-hidden parent would stop the stage from pinning */}
      <div className="absolute inset-0 overflow-hidden rounded-[22px] ring-1 ring-black/[0.04]"><Backdrop /></div>

      <div className="relative grid px-4 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-10 lg:px-10">
        {/* left: one short story per moment of the day */}
        <div className="relative z-0 pb-[30vh] pt-6 lg:pt-[30vh]">
          {HERO_BEATS.map((b, i) => (
            <div
              key={b.time}
              ref={el => { stepRefs.current[i] = el; }}
              data-step={i}
              className="flex min-h-[46vh] flex-col justify-center lg:min-h-[64vh]"
            >
              <motion.div
                /* on phones the other steps would show through behind the pinned phone, so they fade out fully */
                animate={{ opacity: i === step ? 1 : wide ? 0.25 : 0 }}
                transition={{ duration: 0.45 }}
                className="rounded-2xl bg-white/80 p-5 backdrop-blur lg:bg-transparent lg:p-0 lg:backdrop-blur-none"
              >
                <span className="inline-flex h-[26px] items-center rounded-full bg-black px-2.5 text-[12px] font-medium tabular-nums text-white">{b.time}</span>
                <h3 className="mt-4 font-display text-[28px] font-normal leading-[1.1] tracking-[-0.035em] text-black lg:text-[34px]">{b.caption}</h3>
                <p className="mt-3 font-display text-[16px] leading-[1.4] tracking-[-0.01em] text-black/60 lg:text-[17px]">
                  Site Bot: <span className="text-black/85">{b.decision.label}</span>
                </p>
                {b.checks.length > 0 && (
                  <ul className="mt-4 space-y-1.5 border-t border-black/10 pt-4">
                    {b.checks.map(c => (
                      <li key={c.text} className={cn('flex items-center gap-2 font-display text-[13.5px]', c.ok ? 'text-black/70' : 'font-medium text-[#b8350f]')}>
                        {c.ok ? <Check className="h-3.5 w-3.5 shrink-0 text-[#2f6b45]" strokeWidth={2.6} /> : <AlertCircle className="h-3.5 w-3.5 shrink-0" />}
                        {c.text}
                      </li>
                    ))}
                  </ul>
                )}
                {b.summary && (
                  <ul className="mt-4 space-y-1.5 border-t border-black/10 pt-4">
                    {b.summary.map(s => <li key={s} className="font-display text-[13.5px] text-black/70">{s}</li>)}
                  </ul>
                )}
              </motion.div>
            </div>
          ))}
        </div>

        {/* right: the phone and the CRM, pinned while the story scrolls (on phones: the phone alone, on top) */}
        <div className="sticky top-0 z-10 order-first flex h-[60vh] items-center justify-center lg:order-none lg:h-screen lg:self-start">
          {/* progress rail */}
          <div className="absolute left-0 top-1/2 hidden -translate-y-1/2 flex-col gap-2.5 lg:flex" aria-hidden="true">
            {HERO_BEATS.map((b, i) => (
              <span key={b.time} className={cn('block rounded-full transition-all duration-300', i === step ? 'h-5 w-1.5 bg-black' : i < step ? 'h-1.5 w-1.5 bg-black/45' : 'h-1.5 w-1.5 bg-black/15')} />
            ))}
          </div>

          <div className="flex items-center gap-8 [zoom:0.62] sm:[zoom:0.75] lg:[zoom:0.82] xl:[zoom:0.88]">
            <Phone p={p} reducedMotion={false} />
            <div className="hidden w-[600px] shrink-0 lg:block">
              <CrmWindow p={p} feed={feed} landing posted={posted} waiting={books.pm.length} blocked={books.blocked} bills={bills} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
