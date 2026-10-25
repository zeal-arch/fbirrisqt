import { forwardRef, useEffect, useState } from 'react';
import { AnimatePresence, animate, motion } from 'motion/react';
import {
  AlertCircle, Ban, Banknote, CheckCircle2, ChevronDown, Clock3, Copy, FileText, Grid3x3, Hammer, Layers, PaintRoller,
  Ruler, Activity as ActivityIcon, Wrench, Zap, type LucideIcon,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { HERO_BEATS, inr, type RowStatus } from '../../data/botShowcase';
import { STATUS, statusOfFeed } from './status';
import PmApprove from './PmApprove';

/* Amplemarket-style live list: "Recently added", newest on top, each row with a small logo tile on the left
   and a short signal with an icon on the right. Rows come from what the bot did, beat by beat. */

export type FeedTone = 'posted' | 'wait' | 'pm' | 'blocked' | 'progress';
export interface FeedItem { key: string; title: string; sub: string; amount?: number; signal: string; tone: FeedTone; at: number }

const SIGNAL: Record<RowStatus, [string, FeedTone]> = {
  claimed: ['Waiting for bill', 'wait'],
  posted: ['Bill matched · posted', 'posted'],
  'needs-pm': ['Price looks high · to PM', 'pm'],
};

/* Earlier entries, so the list is already alive before the day starts. */
const SEED: FeedItem[] = [
  { key: 'seed-primer', title: 'Ravi · painter', sub: 'Living room · primer coat done', signal: 'Progress logged', tone: 'progress', at: -1 },
  { key: 'seed-adhesive', title: 'Sri Lakshmi Tiles', sub: 'Tile adhesive 20 bags', amount: 6400, signal: 'Bill matched · posted', tone: 'posted', at: -1 },
  { key: 'seed-quote', title: 'Merino Gallery', sub: 'Laminate quote · 3 pages', signal: 'Filed for comparison', tone: 'progress', at: -1 },
  { key: 'seed-channels', title: 'Deepak Hardware', sub: 'Ebco drawer channels', amount: 7800, signal: 'Bill matched · posted', tone: 'posted', at: -1 },
  { key: 'seed-conduit', title: 'Imran · electrician', sub: 'Conduit piping done · kitchen', signal: 'Progress logged', tone: 'progress', at: -1 },
  { key: 'seed-advance', title: 'Advance to Suresh', sub: 'Carcass material', amount: 10000, signal: 'Approved by PM', tone: 'posted', at: -1 },
];

export function buildFeed(reached: (i: number) => boolean): FeedItem[] {
  const items = [...SEED];
  const amounts: Record<string, number> = {};
  HERO_BEATS.forEach((b, i) => {
    if (!reached(i)) return;
    const hasRow = b.ops.some(o => o.type === 'row');
    for (const op of b.ops) {
      if (op.type === 'row') {
        amounts[op.id] = op.amount;
        const [signal, tone] = SIGNAL[op.status];
        items.unshift({ key: op.id, title: op.vendor, sub: op.item, amount: op.amount, signal, tone, at: i });
      } else if (op.type === 'status') {
        const idx = items.findIndex(x => x.key === op.id);
        if (idx >= 0) {
          const [signal, tone] = SIGNAL[op.status];
          const [it] = items.splice(idx, 1);
          items.unshift({ ...it, signal, tone, at: i });
        }
      } else if (op.type === 'pm') {
        if (!hasRow) items.unshift({ key: op.id, title: op.title, sub: op.detail, amount: op.amount ?? undefined, signal: 'Sent to PM', tone: 'pm', at: i });
      } else if (op.type === 'progress') {
        items.unshift({ key: op.id, title: op.text, sub: `${op.by} · voice note`, signal: 'Progress logged', tone: 'progress', at: i });
      } else if (op.type === 'approve') {
        const idx = items.findIndex(x => x.key === op.id);
        if (idx >= 0) {
          const [it] = items.splice(idx, 1);
          items.unshift({ ...it, signal: 'Approved by Arjun', tone: 'posted', at: i });
        }
      } else {
        items.unshift({ key: op.id, title: 'Raju Traders', sub: 'Same bill photo again', amount: op.amount, signal: 'Duplicate blocked', tone: 'blocked', at: i });
      }
    }
  });
  return items;
}

const TONE_ICON: Record<FeedTone, LucideIcon> = {
  posted: CheckCircle2,
  wait: Clock3,
  pm: AlertCircle,
  blocked: Ban,
  progress: ActivityIcon,
};

const LOGO: Record<string, { icon: LucideIcon; tint: string }> = {
  'PUR-301': { icon: Layers, tint: '#efe6da' },
  'PUR-303': { icon: Zap, tint: '#eceef3' },
  'PUR-304': { icon: Wrench, tint: '#ece8f1' },
  'RV-11': { icon: Banknote, tint: '#e9efe9' },
  'RV-14': { icon: Ruler, tint: '#f1e9e4' },
  'PRG-88': { icon: Hammer, tint: '#eee9df' },
  'DUP-1': { icon: Copy, tint: '#f1e7e3' },
  'seed-primer': { icon: PaintRoller, tint: '#e8edf0' },
  'seed-adhesive': { icon: Grid3x3, tint: '#edeae4' },
  'seed-quote': { icon: FileText, tint: '#ebe8ef' },
  'seed-channels': { icon: Wrench, tint: '#eceef1' },
  'seed-conduit': { icon: Zap, tint: '#efece6' },
  'seed-advance': { icon: Banknote, tint: '#e9eee8' },
};

export function AnimatedNumber({ value, format }: { value: number; format: (n: number) => string }) {
  const [shown, setShown] = useState(value);
  useEffect(() => {
    const c = animate(shown, value, { duration: 0.9, ease: 'easeOut', onUpdate: v => setShown(Math.round(v)) });
    return () => c.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return <>{format(shown)}</>;
}

/* approving: the key of the item the PM is about to approve; that row shows his cursor clicking Approve */
interface Props { items: FeedItem[]; current: number; landing: boolean; posted: number; waiting: number; approving?: string | null; bare?: boolean; className?: string }

const BooksFeed = forwardRef<HTMLUListElement, Props>(function BooksFeed({ items, current, landing, posted, waiting, approving, bare, className }, listRef) {
  return (
    <div className={cn('overflow-hidden bg-white', !bare && 'rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.04),0_30px_60px_-30px_rgba(0,0,0,0.35)] ring-1 ring-black/[0.06]', className)}>
      <div className="flex items-center gap-2 border-b border-black/[0.06] px-3.5 py-2.5 text-[12.5px]">
        <span className="h-3.5 w-3.5 rounded-[4px] border border-black/15" aria-hidden="true" />
        <ChevronDown className="h-3.5 w-3.5 text-black/45" aria-hidden="true" />
        <span className="font-medium text-black/80">Recently added</span>
        <motion.span key={items.length} initial={{ scale: 1.25 }} animate={{ scale: 1 }} className="rounded-md bg-black/[0.05] px-1.5 text-[11px] tabular-nums text-black/60">
          {items.length}
        </motion.span>
      </div>

      <ul ref={listRef} className={cn(bare ? "h-[340px]" : "h-[372px]", "overflow-hidden [mask-image:linear-gradient(to_bottom,#000_80%,transparent)]")}>
        <AnimatePresence initial={false}>
          {items.map(it => {
            const fresh = it.at === current && landing;
            const logo = LOGO[it.key] ?? { icon: Layers, tint: '#eee' };
            const Icon = TONE_ICON[it.tone];
            const st = STATUS[statusOfFeed(it.tone)];
            return (
              <motion.li
                key={it.key}
                layout
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], layout: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }}
                className={cn('relative flex items-center gap-2.5 border-b border-black/[0.05] px-3.5 py-[9px] transition-colors duration-700', fresh ? st.row : 'bg-white')}
              >
                {/* the row the bot just wrote lights up in its status colour while its reply shows in the chat */}
                <span className={cn('absolute inset-y-0 left-0 w-[3px] transition-opacity duration-700', st.dot, fresh ? 'opacity-100' : 'opacity-0')} aria-hidden="true" />
                <span className="h-3.5 w-3.5 shrink-0 rounded-[4px] border border-black/10" aria-hidden="true" />
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg ring-1 ring-black/[0.04]" style={{ background: logo.tint }} aria-hidden="true">
                  <logo.icon className="h-4 w-4 text-black/70" strokeWidth={1.8} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-semibold text-black/90">{it.title}</span>
                  <span className="block truncate text-[11.5px] text-black/45">{it.sub}</span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-0.5">
                  {it.amount !== undefined && <span className={cn('text-[13px] font-medium tabular-nums', it.tone === 'blocked' ? 'text-black/35 line-through' : 'text-black/85')}>{inr(it.amount)}</span>}
                  {approving === it.key ? (
                    <PmApprove />
                  ) : (
                    <motion.span key={it.signal} initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} className={cn('flex items-center gap-1 text-[11px]', st.text)}>
                      <span className="hidden max-w-[150px] truncate sm:inline">{it.signal}</span>
                      <Icon className="h-3.5 w-3.5" />
                    </motion.span>
                  )}
                </span>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>

      {!bare && <div className="flex items-center gap-4 border-t border-black/[0.06] px-3.5 py-2.5 text-[11.5px] text-black/45">
        <span><span className="font-semibold tabular-nums text-black"><AnimatedNumber value={posted} format={inr} /></span> posted today</span>
        <span><span className="font-semibold tabular-nums text-black">{waiting}</span> waiting for the PM</span>
      </div>}
    </div>
  );
});

export default BooksFeed;
