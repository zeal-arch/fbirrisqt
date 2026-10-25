import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { inr } from '../../data/botShowcase';
import type { usePresenter } from '../../hooks/usePresenter';
import BotCard from './BotCard';
import { LIVE_DOT } from './status';
import BotMark from './BotMark';
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
  blocked?: number;
  bills: number;
}

const CrmWindow = forwardRef<HTMLUListElement, Props>(function CrmWindow({ p, feed, landing, posted, waiting, bills }, listRef) {
  return (
    /* same lift as the phone, so the two read as one product */
    <div className="overflow-hidden rounded-[20px] bg-white shadow-[0_2px_0_rgba(0,0,0,0.05),0_40px_70px_-30px_rgba(40,25,10,0.55)] ring-1 ring-black/[0.08]">
      {/* title bar */}
      <div className="relative flex h-9 items-center border-b border-black/[0.06] px-3.5">
        <span className="flex gap-1.5" aria-hidden="true">
          {[0, 1, 2].map(i => <i key={i} className="h-2.5 w-2.5 rounded-full bg-black/10" />)}
        </span>
        <span className="pointer-events-none absolute inset-x-0 text-center text-[11.5px] text-black/40">firstbriq CRM · Site Bot</span>
        <span className="ml-auto flex items-center gap-1.5 text-[11px] text-black/50">
          <span className="relative flex h-1.5 w-1.5"><span className={cn('absolute inline-flex h-full w-full animate-ping rounded-full opacity-50', LIVE_DOT)} /><span className={cn('relative h-1.5 w-1.5 rounded-full', LIVE_DOT)} /></span>
          Live
        </span>
      </div>

      {/* project bar, and which group the bot is reading */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-black/[0.06] px-4 py-2.5">
        <span className="flex items-center gap-1.5 rounded-lg bg-black/[0.04] px-2 py-1 text-[13px] font-medium">
          HSR 3BHK · Mrs. Rao <ChevronDown className="h-3 w-3 text-black/45" />
        </span>
        <span className="ml-auto flex items-center gap-1.5 text-[12px] text-black/50">
          <BotMark size={16} /> Reading “HSR 3BHK Site”
        </span>
      </div>

      {/* numbers */}
      <div className="grid grid-cols-3 border-b border-black/[0.06]">
        <Kpi label="Posted today" value={<AnimatedNumber value={posted} format={inr} />} />
        <Kpi label="For the PM" value={waiting} tone={waiting ? 'text-primary' : undefined} />
        <Kpi label="Bills missing" value={bills} last />
      </div>

      {/* feed and reasoning */}
      <div className="grid md:grid-cols-[minmax(0,1fr)_240px] xl:grid-cols-[minmax(0,1fr)_290px]">
        <BooksFeed ref={listRef} bare items={feed} current={p.index} landing={landing} posted={posted} waiting={waiting} className="md:border-r md:border-black/[0.06]" />
        <div className="hidden bg-[#fbfaf8] md:block">
          <BotCard bare p={p} />
        </div>
      </div>
    </div>
  );
});

function Kpi({ label, value, tone, last }: { label: string; value: React.ReactNode; tone?: string; last?: boolean }) {
  return (
    <div className={cn('px-4 py-3', !last && 'border-r border-black/[0.06]')}>
      <p className="text-[12px] text-black/45">{label}</p>
      <p className={cn('mt-0.5 text-[22px] font-medium tabular-nums tracking-[-0.01em] text-black', tone)}>{value}</p>
    </div>
  );
}

export default CrmWindow;
