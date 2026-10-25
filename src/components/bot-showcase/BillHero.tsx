import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { HERO_BEATS, type Bill, type ChatMessage } from '../../data/botShowcase';
import { MessageBubble, to12 } from './ChatParts';
import BotMark from './BotMark';
import { STATUS } from './status';
import wallpaper from '../../assets/chat-wallpaper.webp';

/* The hero moment: a handwritten bill arrives in the site's WhatsApp group, Site Bot scans it, and the entry it
   reads out appears beside it, field by field, in step with the boxes on the photo. Replays every few seconds. */

const BILL_BEAT = HERO_BEATS.find(b => b.message?.kind === 'bill')!;
const MESSAGE = BILL_BEAT.message as Extract<ChatMessage, { kind: 'bill' }>;
const LOOP = 7000;

export default function BillHero() {
  const reduced = useReducedMotion();
  const [run, setRun] = useState(0);
  useEffect(() => {
    if (reduced) return;
    const t = window.setInterval(() => setRun(r => r + 1), LOOP);
    return () => window.clearInterval(t);
  }, [reduced]);

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:justify-end">
      {/* the bill as it arrived in the group, on the real chat wallpaper */}
      <figure className="shrink-0">
        <div className="rounded-[22px] p-5 ring-1 ring-black/[0.05]" style={{ backgroundColor: '#efe7dd', backgroundImage: `url(${wallpaper})`, backgroundSize: 'cover' }}>
          <div className="flex w-[210px] flex-col [zoom:1.3] xl:[zoom:1.55]">
            <MessageBubble key={run} message={MESSAGE} time={BILL_BEAT.time} first live />
          </div>
        </div>
        <figcaption className="mt-2 text-center text-[12px] text-black/45">In the HSR 3BHK Site group · {to12(BILL_BEAT.time)}</figcaption>
      </figure>

      <ReadCard key={run} bill={MESSAGE.bill} />
    </div>
  );
}

/* What Site Bot read from the bill; each field appears as its box is drawn on the photo. */
function ReadCard({ bill }: { bill: Bill }) {
  const rows = [
    { label: 'Vendor', value: bill.shop, at: 1.25 },
    { label: 'Items', value: bill.lines.join(' · '), at: 1.5 },
    { label: 'Total', value: `₹${bill.total}`, at: 1.75, big: true },
    { label: 'Project', value: 'HSR 3BHK, matches the 8:12 am message', at: 2.15 },
  ];
  return (
    <div className="w-full max-w-[300px] rounded-[18px] bg-white p-4 shadow-[0_24px_48px_-28px_rgba(40,25,10,0.45)] ring-1 ring-black/[0.06] xl:max-w-[330px] xl:p-5">
      <p className="flex items-center gap-2 text-[13px] font-medium text-black"><BotMark size={18} /> Site Bot read this bill</p>
      <dl className="mt-2 divide-y divide-black/[0.06]">
        {rows.map(r => (
          <motion.div
            key={r.label}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: r.at, duration: 0.35 }}
            className="flex items-baseline justify-between gap-4 py-2"
          >
            <dt className="shrink-0 text-[12px] text-black/45">{r.label}</dt>
            <dd className={cn('text-right text-[13px] leading-snug text-black/85', r.big && 'text-[20px] font-medium tabular-nums tracking-[-0.01em] text-black')}>{r.value}</dd>
          </motion.div>
        ))}
      </dl>
      <motion.p
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.6, duration: 0.35 }}
        className={cn('mt-2 inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-[12px] font-medium', STATUS.posted.pill)}
      >
        <CheckCircle2 className="h-3.5 w-3.5" /> Posted to HSR 3BHK · Material
      </motion.p>
    </div>
  );
}
