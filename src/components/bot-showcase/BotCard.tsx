import { forwardRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Check, ChevronDown, Lock, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { HERO_BEATS, PEOPLE } from '../../data/botShowcase';
import type { usePresenter } from '../../hooks/usePresenter';
import BotMark from './BotMark';

/* Summation-style agent panel: the message the bot is reading, a collapsible "Ran 3 checks" list,
   then what it decided. Shows only the current beat, so it stays calm. */

type Presenter = ReturnType<typeof usePresenter>;
const KIND: Record<string, string> = { text: 'Text', voice: 'Voice note', bill: 'Bill photo' };

const BotCard = forwardRef<HTMLDivElement, { p: Presenter; bare?: boolean; className?: string }>(function BotCard({ p, bare, className }, ref) {
  const beat = HERO_BEATS[p.index];
  const m = beat.message;
  const checks = p.checksShown(p.index);
  const decided = p.reached(p.index, 'decided');
  const replied = p.reached(p.index, 'replied');
  const status = p.phase === 'typing' ? 'Listening' : p.phase === 'message' ? 'Reading' : p.phase === 'checks' ? 'Checking' : 'Done';

  return (
    <div ref={ref} className={cn('p-4', !bare && 'rounded-2xl bg-white/95 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_30px_60px_-30px_rgba(0,0,0,0.35)] ring-1 ring-black/[0.06] backdrop-blur', className)}>
      <div className="mb-3 flex items-center gap-2">
        <BotMark size={24} />
        <span className="text-[13px] font-semibold">Site Bot</span>
        <span className="ml-auto flex items-center gap-1.5 rounded-full bg-black/[0.04] px-2 py-0.5 text-[11px] text-black/55">
          <span className={cn('h-1.5 w-1.5 rounded-full', status === 'Done' ? 'bg-black/35' : status === 'Listening' ? 'bg-black/20' : 'animate-pulse bg-primary')} />
          {status}
        </span>
      </div>

      {/* fixed height, so the card never grows or shrinks between messages */}
      <div className={cn('overflow-hidden', bare ? 'h-[300px] [mask-image:linear-gradient(to_bottom,#000_85%,transparent)]' : 'h-[310px]')}>
      <AnimatePresence mode="wait">
        <motion.div key={p.index} initial={{ opacity: 0, y: 6, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -6, filter: 'blur(4px)' }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
          {p.phase === 'typing' ? (
            <p className="flex items-center gap-1 py-2 text-[13px] text-black/45">
              Listening to HSR 3BHK Site
              {[0, 1, 2].map(i => <span key={i} className="inline-block h-1 w-1 animate-bounce rounded-full bg-black/35" style={{ animationDelay: `${i * 0.15}s` }} />)}
            </p>
          ) : (
            <>
              {m ? (
                <div className="rounded-xl bg-[#f6f4f1] px-3 py-2.5">
                  <p className="mb-1 text-[11px] text-black/45"><span className="font-semibold text-black/75">{PEOPLE[m.from].name}</span> · {KIND[m.kind]} · {beat.time}</p>
                  <p className="line-clamp-3 text-[13px] leading-snug text-black/80">
                    {m.kind === 'text' ? m.text : m.kind === 'voice' ? `“${m.transcript}”` : `${m.bill.shop} bill · ${m.bill.lines.join(', ')} · ₹${m.bill.total}`}
                  </p>
                </div>
              ) : (
                <p className="text-[16px] font-medium">{beat.time} · End of day</p>
              )}

              {beat.checks.length > 0 && checks > 0 && (
                <div className="mt-3">
                  <p className="flex items-center gap-1 text-[12px] text-black/50">
                    <ChevronDown className="h-3 w-3" />
                    {checks < beat.checks.length || p.phase === 'checks' && !decided ? 'Running checks…' : `Ran ${beat.checks.length} checks`}
                  </p>
                  <ul className="mt-1.5 flex flex-col gap-1 pl-1">
                    {beat.checks.slice(0, checks).map(c => (
                      <motion.li key={c.text} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="flex items-start gap-2 text-[12.5px] leading-snug text-black/75">
                        {c.ok ? <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-black/45" /> : <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />}
                        {c.text}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}

              {decided && (
                <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-3 flex items-center gap-1.5 border-t border-black/[0.06] pt-3 text-[13px] font-semibold text-black">
                  <ArrowRight className="h-3.5 w-3.5" /> {beat.decision.label}
                </motion.p>
              )}
              {decided && beat.summary && (
                <ul className="mt-2 rounded-xl bg-[#f6f4f1] px-3 py-2 text-[12.5px] leading-relaxed text-black/70">
                  {beat.summary.map(s => <li key={s}>{s}</li>)}
                </ul>
              )}
              {beat.reply?.private && replied && (
                <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-2 rounded-xl bg-[#f6f4f1] px-3 py-2 text-[12px] leading-snug text-black/70">
                  <span className="mb-0.5 flex items-center gap-1 text-[10.5px] font-semibold uppercase tracking-wider text-black/45"><Lock className="h-3 w-3" /> Private note to Arjun</span>
                  {beat.reply.text}
                </motion.p>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>
      </div>
    </div>
  );
});

export default BotCard;
