import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react';
import { Pause, Play, RotateCcw, SkipForward } from 'lucide-react';
import { cn } from '../../lib/utils';
import { HERO_BEATS, booksFrom, nextApproval } from '../../data/botShowcase';
import { usePresenter } from '../../hooks/usePresenter';
import Phone from './Phone';
import CrmWindow from './CrmWindow';
import { buildFeed, chipFor } from './BooksFeed';
import { STATUS, statusOfFeed } from './status';
import Backdrop from './Backdrop';
import FlowLines from './FlowLines';
import { PeekerHands, PeekerHead, type Mood } from './Peeker';

/* The hero stage, mixing amplemarket.com and summation.com:
   - Amplemarket: a soft light-blue and peach backdrop, faint lines flowing in from the left, a live
     "Recently added" list and a doodle character peeking over the window.
   - Summation: one large rounded frame holding a big product window, here the firstbriq CRM.
   - Ours: the site's WhatsApp group on a line-art iPhone. Every message flows in along the lines, and when
     the bot decides, a chip flies out of the chat and lands in the CRM. */

const SHAPES = HERO_BEATS.map(b => ({ hasMessage: b.message !== null, checks: b.checks.length, hasReply: Boolean(b.reply) }));
const ease = [0.22, 1, 0.36, 1] as const;

type Presenter = ReturnType<typeof usePresenter>;
interface Geo {
  chip: { x0: number; y0: number; x1: number; y1: number };
  flow: { x0: number; y0a: number; y0b: number; x1: number; y1: number; h: number };
  /* lines from the phone's right edge fanning out across the CRM's left edge */
  flowRight: { x0: number; y0a: number; y0b: number; x1: number; y1: number; h: number };
}

export default function Stage() {
  const reducedMotion = Boolean(useReducedMotion());
  const rootRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const inView = useInView(rootRef, { amount: 0.1 });
  const p = usePresenter(SHAPES, { active: inView, reducedMotion });
  const beat = HERO_BEATS[p.index];

  /* The current beat's entry joins the CRM only once the flying chip has landed, so no empty row shows. */
  const [landed, setLanded] = useState(true);
  useEffect(() => {
    if (p.phase !== 'decided' || reducedMotion) { setLanded(true); return; }
    setLanded(false);
    const t = window.setTimeout(() => setLanded(true), 700);
    return () => window.clearTimeout(t);
  }, [p.index, p.phase, reducedMotion]);
  const reachedDecided = useCallback((i: number) => p.reached(i, 'decided') && (i !== p.index || landed), [p.reached, p.index, landed]);
  const feed = useMemo(() => buildFeed(reachedDecided), [reachedDecided]);
  const books = useMemo(() => booksFrom(HERO_BEATS.filter((_, i) => reachedDecided(i))), [reachedDecided]);
  const posted = books.rows.filter(r => r.status === 'posted').reduce((a, r) => a + r.amount, 0);
  const bills = books.rows.filter(r => r.status === 'claimed').length;
  const landing = p.phase === 'decided' || p.phase === 'replied';
  const chip = p.phase === 'decided' ? chipFor(p.index) : null;
  /* once the bot has asked the PM, his cursor clicks Approve before the next beat posts it */
  const approving = p.reached(p.index, 'replied') ? nextApproval(p.index) : null;
  const mood: Mood = !p.reached(p.index, 'decided') ? 'neutral' : ['pm', 'blocked', 'ask'].includes(beat.decision.tone) ? 'alert' : 'happy';

  /* Positions for the flow lines and the flying chip, measured from the real layout (wide screens only). */
  const [geo, setGeo] = useState<Geo | null>(null);
  useLayoutEffect(() => {
    const measure = () => {
      const f = frameRef.current?.getBoundingClientRect();
      const ph = phoneRef.current?.getBoundingClientRect();
      const l = listRef.current?.getBoundingClientRect();
      /* stacked (phone-width) layout: the CRM sits below the phone, so no lines or chip */
      if (!f || !ph || !l || l.top > ph.bottom) { setGeo(null); return; }
      /* the frame is zoomed to 88% on wide screens; convert screen pixels back to the frame's own */
      const z = parseFloat(getComputedStyle(frameRef.current!).zoom) || 1;
      const bubbleY = (ph.top + ph.height * 0.7 - f.top) / z;
      setGeo({
        chip: { x0: (ph.right - 70 - f.left) / z, y0: bubbleY, x1: (l.left + 150 - f.left) / z, y1: (l.top + 24 - f.top) / z },
        /* the site: lines spread along the frame's left edge, gathering into the phone */
        flow: { x0: 0, y0a: -120, y0b: f.height / z + 120, x1: (ph.left + 4 - f.left) / z, y1: (ph.top + ph.height / 2 - f.top) / z, h: f.height / z },
        /* the bot: lines fan out of the phone across the CRM's left edge */
        flowRight: { x0: (l.left - f.left) / z, y0a: (l.top - 150 - f.top) / z, y0b: (l.bottom - f.top) / z, x1: (ph.right - 4 - f.left) / z, y1: (ph.top + ph.height / 2 - f.top) / z, h: f.height / z },
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (frameRef.current) ro.observe(frameRef.current);
    return () => ro.disconnect();
  }, [p.index, p.phase]);

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); p.step(); }
  };

  return (
    <div ref={rootRef} onKeyDown={onKey} role="region" aria-label="Example: Site Bot reading one day in a site WhatsApp group" className="text-left">
      <div ref={frameRef} className="relative overflow-hidden rounded-[22px] ring-1 ring-black/[0.04] lg:[zoom:0.88]">
        <Backdrop />
        {geo && <FlowLines {...geo.flow} pulseKey={beat.message && p.reached(p.index, 'message') ? p.index : null} lane={p.index} />}
        {geo && <FlowLines {...geo.flowRight} outward pulseKey={chip ? p.index : null} lane={p.index + 1} />}

        {/* Wide screens: one left-to-right story. Lines from the site (the frame's left edge) gather into the
            phone; lines fan out of the phone into the CRM, where the bot's reasoning sits beside the feed.
            Narrower screens keep the simple row/stack. */}
        {/* one label over each half, on a shared line (wide screens) */}
        <div className="pointer-events-none absolute inset-x-0 top-[96px] z-30 hidden xl:block" aria-hidden="true">
          <HalfLabel n="01" className="left-[26%] -translate-x-1/2">In the WhatsApp group</HalfLabel>
          <HalfLabel n="02" className="left-[calc(26%+265px)]">In your firstbriq CRM</HalfLabel>
        </div>

        <div className="relative flex flex-col items-center gap-8 px-4 py-10 lg:h-[760px] lg:flex-row lg:items-center lg:justify-center lg:gap-16 lg:px-8 lg:py-0 xl:block xl:h-[900px] xl:p-0">
          {/* the phone */}
          <div className="relative z-20 shrink-0 xl:absolute xl:left-[26%] xl:top-1/2 xl:-translate-x-1/2 xl:-translate-y-1/2" style={{ perspective: 1400 }}>
            <motion.div
              ref={phoneRef}
              initial={{ opacity: 0, y: 70, rotateX: 16 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.1, ease }}
            >
              <Phone p={p} reducedMotion={reducedMotion} />
            </motion.div>
          </div>

          {/* the CRM, with the PM peeking over it */}
          <motion.div
            className="relative z-10 w-full max-w-[760px] lg:w-[600px] xl:absolute xl:left-[calc(26%+265px)] xl:top-1/2 xl:mt-0 xl:w-[720px] xl:-translate-y-1/2"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.2, ease }}
          >
            {/* zoomed up inside, so its text sits closer to the phone's in size (zooming the outer box would also scale its position) */}
            <div className="relative xl:[zoom:1.1]">
              <div className="absolute -top-[84px] right-10 z-0 hidden overflow-hidden xl:block" style={{ height: 88 }}>
                <PeekerHead mood={mood} nodKey={mood === 'happy' && landed ? p.index : -1} />
              </div>
              <div className="relative z-10">
                <CrmWindow ref={listRef} p={p} feed={feed} landing={landing} posted={posted} waiting={books.pm.length} blocked={books.blocked} bills={bills} approving={approving} />
              </div>
              <div className="absolute -top-[9px] right-[38px] z-20 hidden xl:block">
                <PeekerHands />
              </div>
            </div>
          </motion.div>
        </div>

        {/* chip that flies from the chat into the CRM */}
        <AnimatePresence>
          {geo && chip && !reducedMotion && (
            <motion.div
              key={'chip' + p.index}
              className={cn('pointer-events-none absolute left-0 top-0 z-40 flex items-center gap-1.5 whitespace-nowrap rounded-full bg-white px-3 py-1.5 text-[12px] font-medium text-black shadow-[0_8px_24px_-6px_rgba(0,0,0,0.35)] ring-1 ring-black/10', chip.tone === 'blocked' && 'text-black/50 line-through')}
              initial={{ x: geo.chip.x0, y: geo.chip.y0, opacity: 0, scale: 0.6 }}
              animate={{
                x: [geo.chip.x0, (geo.chip.x0 + geo.chip.x1) / 2, geo.chip.x1],
                y: [geo.chip.y0, Math.min(geo.chip.y0, geo.chip.y1) - 70, geo.chip.y1],
                opacity: [0, 1, 1, 0],
                scale: [0.6, 1.05, 1, 0.9],
              }}
              transition={{ duration: 0.8, ease: 'easeInOut', times: [0, 0.5, 1], opacity: { duration: 0.8, times: [0, 0.15, 0.85, 1] }, scale: { duration: 0.8, times: [0, 0.4, 0.85, 1] } }}
              style={{ translateX: '-50%', translateY: '-50%' }}
            >
              <span className={cn('h-1.5 w-1.5 rounded-full', STATUS[statusOfFeed(chip.tone)].dot)} />
              {chip.label}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Controls p={p} />
    </div>
  );
}

function HalfLabel({ n, className, children }: { n: string; className: string; children: ReactNode }) {
  return (
    <span className={cn('absolute flex items-center gap-2 whitespace-nowrap rounded-full bg-white/70 px-3 py-1 text-[12.5px] text-black/60 ring-1 ring-black/[0.05] backdrop-blur', className)}>
      <span className="tabular-nums text-black/30">{n}</span>
      {children}
    </span>
  );
}

/* ---------- controls ---------- */

export function Controls({ p }: { p: Presenter }) {
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
