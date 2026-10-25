import { useMemo, useRef, type KeyboardEvent } from 'react';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react';
import { AlertCircle, Ban, Check, CheckCircle2, Clock3, HelpCircle, MessageSquareText, Mic, Receipt, type LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { HERO_BEATS, PEOPLE, booksFrom, inr, nextApproval, pmItem, type Beat, type BookOp, type Tone } from '../../data/botShowcase';
import { usePresenter } from '../../hooks/usePresenter';
import Phone from './Phone';
import Backdrop from './Backdrop';
import BotMark from './BotMark';
import { AnimatedNumber } from './BooksFeed';
import { BillPhoto, WaveBars, to12 } from './ChatParts';
import { Controls } from './Stage';
import PmApprove from './PmApprove';
import { LIVE_DOT, STATUS, statusOfDecision } from './status';

/* Design B: the phone at the centre. On the left, what comes in from the site (a bill photo, a voice note,
   a text); on the right, what Site Bot files in the firstbriq CRM. Same scripted day as A. */

const SHAPES = HERO_BEATS.map(b => ({ hasMessage: b.message !== null, checks: b.checks.length, hasReply: Boolean(b.reply) }));
const ease = [0.22, 1, 0.36, 1] as const;
const cardShadow = 'shadow-[0_18px_34px_-22px_rgba(40,25,10,0.45)]';

type Presenter = ReturnType<typeof usePresenter>;

export default function StageB() {
  const reducedMotion = Boolean(useReducedMotion());
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { amount: 0.1 });
  const p = usePresenter(SHAPES, { active: inView, reducedMotion });

  /* newest first, three at most */
  const incoming = HERO_BEATS.map((b, i) => ({ b, i })).filter(({ b, i }) => b.message && p.reached(i, 'typing')).slice(-3).reverse();
  const outgoing = HERO_BEATS.map((b, i) => ({ b, i })).filter(({ b, i }) => p.reached(i, b.checks.length ? 'checks' : 'decided')).slice(-3).reverse();

  const books = useMemo(() => booksFrom(HERO_BEATS.filter((_, i) => p.reached(i, 'decided'))), [p.reached]);
  const posted = books.rows.filter(r => r.status === 'posted').reduce((a, r) => a + r.amount, 0);
  const bills = books.rows.filter(r => r.status === 'claimed').length;
  /* once the bot has asked the PM, his cursor clicks Approve on that card before the next beat posts it */
  const approving = p.reached(p.index, 'replied') ? nextApproval(p.index) : null;

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); p.step(); }
  };

  return (
    <div ref={rootRef} onKeyDown={onKey} role="region" aria-label="Example: Site Bot reading one day in a site WhatsApp group" className="text-left">
      <div className="relative overflow-hidden rounded-[22px] ring-1 ring-black/[0.05]">
        <Backdrop />

        <div className="relative flex flex-col items-center gap-8 px-4 py-10 lg:flex-row lg:justify-center lg:gap-14 lg:px-8 xl:h-[760px] xl:gap-[92px] xl:py-0">
          {/* in: from the site (wide screens only) */}
          <div className="relative z-10 hidden h-[560px] w-[300px] shrink-0 flex-col xl:flex">
            <ColumnLabel>From the site group</ColumnLabel>
            <div className="flex flex-col gap-3 [mask-image:linear-gradient(to_bottom,#000_82%,transparent)]">
              <AnimatePresence initial={false} mode="popLayout">
                {incoming.map(({ b, i }) => (
                  <motion.div key={'in' + i} layout initial={{ opacity: 0, y: -14, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, ease }}>
                    <InCard beat={b} current={i === p.index} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* the phone */}
          <div className="relative z-20 shrink-0" style={{ perspective: 1400 }}>
            <motion.div
              initial={{ opacity: 0, y: 70, rotateX: 16 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.1, ease }}
            >
              <Phone p={p} reducedMotion={reducedMotion} />
            </motion.div>
          </div>

          {/* out: into the firstbriq CRM */}
          <div className="relative z-10 flex h-[560px] w-full max-w-[340px] shrink-0 flex-col lg:w-[300px]">
            <ColumnLabel>Into firstbriq CRM</ColumnLabel>
            <CrmTotals posted={posted} waiting={books.pm.length} bills={bills} />
            <div className="mt-3 flex flex-col gap-3 [mask-image:linear-gradient(to_bottom,#000_82%,transparent)]">
              <AnimatePresence initial={false} mode="popLayout">
                {outgoing.map(({ b, i }) => (
                  <motion.div key={'out' + i} layout initial={{ opacity: 0, y: -14, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, ease, layout: { duration: 0.7, ease } }}>
                    {b.summary ? <SummaryCard beat={b} /> : <OutCard beat={b} i={i} p={p} current={i === p.index} approving={approving !== null && opOf(b, 'pm')?.id === approving} />}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <Controls p={p} />
    </div>
  );
}

function ColumnLabel({ children }: { children: string }) {
  return <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.06em] text-black/45">{children}</p>;
}

/* ---------- in: one message from the site ---------- */

const KIND: Record<'text' | 'voice' | 'bill', { icon: LucideIcon; label: string }> = {
  text: { icon: MessageSquareText, label: 'Text' },
  voice: { icon: Mic, label: 'Voice note' },
  bill: { icon: Receipt, label: 'Bill photo' },
};

function InCard({ beat, current }: { beat: Beat; current: boolean }) {
  const m = beat.message!;
  const who = PEOPLE[m.from];
  const kind = KIND[m.kind];
  return (
    <div className={cn('rounded-2xl bg-white p-3 ring-1 transition-shadow duration-500', cardShadow, current ? 'ring-black/15' : 'ring-black/[0.06]')}>
      <p className="flex items-center gap-1.5 truncate text-[12px]">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: who.color }} aria-hidden="true" />
        <span className="font-medium text-black/85">{who.name}</span>
        <span className="truncate text-black/45">{who.role}</span>
      </p>

      {m.kind === 'text' && <p className="mt-1.5 line-clamp-3 text-[12.5px] leading-[1.4] text-black/80">“{m.text}”</p>}

      {m.kind === 'voice' && (
        <div className="mt-2">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-black" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="10" height="10"><path d="M7 4v16l13-8z" fill="#fff" /></svg>
            </span>
            <WaveBars seed={m.duration.length + m.from.length} played={0} />
            <span className="text-[11px] tabular-nums text-black/45">{m.duration}</span>
          </div>
          <p className="mt-1.5 line-clamp-2 text-[12px] leading-[1.4] text-black/75">“{m.english}”</p>
          <p className="mt-0.5 text-[10.5px] text-black/40">Translated from {m.language}</p>
        </div>
      )}

      {m.kind === 'bill' && (
        <div className="mt-2 flex gap-3">
          {/* the chat's bill photo, shrunk to a thumbnail */}
          <div className="h-[75px] w-[64px] shrink-0 overflow-hidden rounded-md">
            <div className="origin-top-left scale-[0.38]"><BillPhoto bill={m.bill} /></div>
          </div>
          <div className="min-w-0 text-[12px] leading-[1.4]">
            <p className="font-medium text-black/85">{m.bill.shop}</p>
            <p className="truncate text-black/55">{m.bill.lines[0]}</p>
            <p className="mt-1 tabular-nums text-black/80">Total ₹{m.bill.total}</p>
          </div>
        </div>
      )}

      <p className="mt-2 flex items-center gap-1.5 text-[11px] text-black/45">
        <kind.icon className="h-3 w-3" aria-hidden="true" />
        {kind.label} · {to12(beat.time)}
      </p>
    </div>
  );
}

/* ---------- out: what the bot filed ---------- */

const TONE_ICON: Record<Tone, LucideIcon> = {
  posted: CheckCircle2,
  claimed: Clock3,
  pm: AlertCircle,
  ask: HelpCircle,
  blocked: Ban,
  summary: CheckCircle2,
};

function opOf<T extends BookOp['type']>(b: Beat, t: T) {
  return b.ops.find(o => o.type === t) as Extract<BookOp, { type: T }> | undefined;
}

function rowById(id: string) {
  for (const b of HERO_BEATS) for (const o of b.ops) if (o.type === 'row' && o.id === id) return o;
  return undefined;
}

/* The entry's title, detail and amount, from what the bot wrote to the books. */
function entryOf(b: Beat): { title: string; sub: string; amount?: number; strike?: boolean } {
  const blocked = opOf(b, 'blocked');
  if (blocked) return { title: 'Raju Traders', sub: 'Same bill photo, sent again', amount: blocked.amount, strike: true };
  const row = opOf(b, 'row');
  if (row) return { title: row.vendor, sub: row.item, amount: row.amount };
  const status = opOf(b, 'status');
  const matched = status && rowById(status.id);
  if (matched) return { title: matched.vendor, sub: matched.item, amount: matched.amount };
  const approve = opOf(b, 'approve');
  const approved = approve && pmItem(approve.id);
  if (approved) return { title: approved.title, sub: 'Approved by Arjun in the CRM', amount: approved.amount ?? undefined };
  const pm = opOf(b, 'pm');
  if (pm) return { title: pm.title, sub: pm.detail, amount: pm.amount ?? undefined };
  return { title: 'Asked in the group', sub: b.reply?.text ?? '' };
}

function OutCard({ beat, i, p, current, approving }: { beat: Beat; i: number; p: Presenter; current: boolean; approving: boolean }) {
  const decided = p.reached(i, 'decided');
  const shown = p.checksShown(i);
  const entry = entryOf(beat);
  const Icon = TONE_ICON[beat.decision.tone];
  const outcome = statusOfDecision(beat.decision.tone);
  const flagged = decided && outcome === 'pm';
  return (
    <div className={cn('rounded-2xl bg-white p-3 ring-1 transition-shadow duration-500', cardShadow, current && flagged ? 'ring-primary/30' : current ? 'ring-black/15' : 'ring-black/[0.06]')}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[13px] font-medium text-black/90">{entry.title}</p>
          <p className="line-clamp-2 text-[11.5px] leading-[1.4] text-black/50">{entry.sub}</p>
        </div>
        {entry.amount !== undefined && (
          <p className={cn('shrink-0 text-[15px] font-medium tabular-nums tracking-[-0.01em]', entry.strike ? 'text-black/35 line-through' : 'text-black/90')}>{inr(entry.amount)}</p>
        )}
      </div>

      {/* the checks, one by one, while this is the newest entry */}
      <AnimatePresence initial={false}>
        {current && beat.checks.length > 0 && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease }} className="overflow-hidden">
            <ul className="mt-2.5 space-y-1 border-t border-black/[0.06] pt-2.5">
              {beat.checks.slice(0, shown).map(c => (
                <motion.li key={c.text} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className={cn('flex items-center gap-1.5 text-[11.5px]', c.ok ? 'text-black/65' : cn('font-medium', outcome === 'pm' ? STATUS.pm.text : 'text-black/80'))}>
                  {c.ok ? <Check className={cn('h-3 w-3 shrink-0', STATUS.posted.text)} strokeWidth={2.6} /> : <AlertCircle className="h-3 w-3 shrink-0" />}
                  {c.text}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-2.5 flex h-6 items-center justify-between gap-2">
        {decided ? (
          <motion.span initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className={cn('inline-flex h-[22px] min-w-0 items-center gap-1 rounded-full px-2 text-[11px] font-medium', STATUS[outcome].pill)}>
            <Icon className="h-3 w-3 shrink-0" />
            <span className="truncate">{beat.decision.label}</span>
          </motion.span>
        ) : (
          <span className="flex items-center gap-1.5 text-[11px] text-black/45"><BotMark size={14} /> Checking…</span>
        )}
        {approving ? <PmApprove /> : <span className="shrink-0 text-[11px] tabular-nums text-black/40">{to12(beat.time)}</span>}
      </div>
    </div>
  );
}

function SummaryCard({ beat }: { beat: Beat }) {
  return (
    <div className="rounded-2xl bg-[#141414] p-3.5 text-white shadow-[0_18px_34px_-22px_rgba(0,0,0,0.6)]">
      <p className="flex items-center gap-2 text-[12px] font-medium"><BotMark size={16} /> Daily summary to Arjun, PM <span className="ml-auto text-[11px] font-normal tabular-nums text-white/50">{to12(beat.time)}</span></p>
      <ul className="mt-2.5 space-y-1.5 text-[11.5px] leading-[1.4] text-white/75">
        {beat.summary!.map(s => <li key={s} className="flex gap-1.5"><span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-white/40" aria-hidden="true" />{s}</li>)}
      </ul>
    </div>
  );
}

/* The CRM's running numbers for the project, so the column reads as firstbriq, not loose cards. */
function CrmTotals({ posted, waiting, bills }: { posted: number; waiting: number; bills: number }) {
  return (
    <div className={cn('rounded-2xl bg-white ring-1 ring-black/[0.06]', cardShadow)}>
      <div className="flex items-center justify-between border-b border-black/[0.06] px-3 py-2 text-[11.5px]">
        <span className="font-medium text-black/80">HSR 3BHK · Mrs. Rao</span>
        <span className="flex items-center gap-1.5 text-black/50">
          <span className="relative flex h-1.5 w-1.5"><span className={cn('absolute inline-flex h-full w-full animate-ping rounded-full opacity-50', LIVE_DOT)} /><span className={cn('relative h-1.5 w-1.5 rounded-full', LIVE_DOT)} /></span>
          Live
        </span>
      </div>
      <div className="grid grid-cols-3">
        <Total label="Posted today" value={<AnimatedNumber value={posted} format={inr} />} />
        <Total label="For the PM" value={waiting} tone={waiting ? 'text-primary' : undefined} />
        <Total label="Bills due" value={bills} last />
      </div>
    </div>
  );
}

function Total({ label, value, tone, last }: { label: string; value: React.ReactNode; tone?: string; last?: boolean }) {
  return (
    <div className={cn('px-3 py-2.5', !last && 'border-r border-black/[0.06]')}>
      <p className="text-[10.5px] text-black/45">{label}</p>
      <p className={cn('mt-0.5 text-[15px] font-medium tabular-nums tracking-[-0.01em] text-black', tone)}>{value}</p>
    </div>
  );
}
