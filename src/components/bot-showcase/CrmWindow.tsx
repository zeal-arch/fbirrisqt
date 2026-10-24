import { forwardRef } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { cn } from '../../lib/utils';
import { inr } from '../../data/botShowcase';
import type { usePresenter } from '../../hooks/usePresenter';
import BotCard from './BotCard';
import BooksFeed, { AnimatedNumber, type FeedItem } from './BooksFeed';

/* The firstbriq CRM that analyses what Site Bot reads from WhatsApp: a large app window with the project's
   numbers on top, the live "Recently added" feed on the left and the bot's reasoning for the latest entry
   on the right. */

type Presenter = ReturnType<typeof usePresenter>;
interface Props {
  p: Presenter;
  feed: FeedItem[];
  landing: boolean;
  posted: number;
  waiting: number;
  blocked: number;
  bills: number;
}

const TABS = ['Feed', 'Approvals', 'Spend', 'Documents'];

const CrmWindow = forwardRef<HTMLUListElement, Props>(function CrmWindow({ p, feed, landing, posted, waiting, blocked, bills }, listRef) {
  return (
    <div className="overflow-hidden rounded-[16px] bg-white shadow-[0_2px_0_rgba(0,0,0,0.03),0_40px_80px_-36px_rgba(60,40,20,0.45)] ring-1 ring-black/[0.07]">
      {/* title bar */}
      <div className="relative flex h-9 items-center border-b border-black/[0.06] px-3.5">
        <span className="flex gap-1.5" aria-hidden="true">
          {[0, 1, 2].map(i => <i key={i} className="h-2.5 w-2.5 rounded-full bg-black/10" />)}
        </span>
        <span className="pointer-events-none absolute inset-x-0 text-center text-[11.5px] text-black/40">firstbriq CRM · Site Bot</span>
        <span className="ml-auto flex items-center gap-1.5 text-[11px] text-black/50">
          <span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" /><span className="relative h-1.5 w-1.5 rounded-full bg-emerald-500" /></span>
          Live
        </span>
      </div>

      {/* project bar and tabs */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-black/[0.06] px-4 py-2.5">
        <span className="flex items-center gap-1.5 rounded-lg bg-black/[0.04] px-2 py-1 text-[12.5px] font-medium">
          <span className="grid h-4 w-4 place-items-center rounded bg-primary text-[8px] font-bold text-white" aria-hidden="true">fb</span>
          HSR 3BHK · Mrs. Rao <ChevronDown className="h-3 w-3 text-black/45" />
        </span>
        <span className="flex items-center gap-0.5">
          {TABS.map(t => (
            <span key={t} className={cn('rounded-md px-2 py-1 text-[12px]', t === 'Feed' ? 'bg-black text-white' : 'text-black/55')}>{t}</span>
          ))}
        </span>
        <span className="ml-auto hidden items-center gap-1.5 rounded-lg border border-black/[0.08] px-2 py-1 text-[11.5px] text-black/35 sm:flex xl:hidden 2xl:flex">
          <Search className="h-3 w-3" /> Search entries
        </span>
      </div>

      {/* numbers */}
      <div className="grid grid-cols-2 border-b border-black/[0.06] sm:grid-cols-4">
        <Kpi label="Posted today" value={<AnimatedNumber value={posted} format={inr} />} />
        <Kpi label="For the PM" value={waiting} tone={waiting ? 'text-amber-700' : undefined} />
        <Kpi label="Bills missing" value={bills} />
        <Kpi label="Duplicates" value={<AnimatedNumber value={blocked} format={inr} />} last />
      </div>

      {/* feed and reasoning */}
      <div className="grid md:grid-cols-[minmax(0,1fr)_250px] xl:grid-cols-1">
        <BooksFeed ref={listRef} bare items={feed} current={p.index} landing={landing} posted={posted} waiting={waiting} className="md:border-r md:border-black/[0.06] xl:border-r-0" />
        <div className="hidden bg-[#fbfaf8] md:block xl:hidden">
          <BotCard bare p={p} />
        </div>
      </div>
    </div>
  );
});

function Kpi({ label, value, tone, last }: { label: string; value: React.ReactNode; tone?: string; last?: boolean }) {
  return (
    <div className={cn('px-4 py-3', !last && 'sm:border-r sm:border-black/[0.06]')}>
      <p className="text-[11px] text-black/45">{label}</p>
      <p className={cn('mt-0.5 text-[19px] font-medium tabular-nums tracking-[-0.01em] text-black', tone)}>{value}</p>
    </div>
  );
}

export default CrmWindow;
