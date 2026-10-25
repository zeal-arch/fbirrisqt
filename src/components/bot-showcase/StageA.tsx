import { useMemo, useRef, type KeyboardEvent } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import { HERO_BEATS, booksFrom, nextApproval } from '../../data/botShowcase';
import { usePresenter } from '../../hooks/usePresenter';
import Phone from './Phone';
import CrmWindow from './CrmWindow';
import { buildFeed } from './BooksFeed';
import Backdrop from './Backdrop';
import Controls from './Controls';

/* Design A: the site's WhatsApp group on an iPhone, and beside it the firstbriq CRM filling in as Site Bot reads
   each message. One large rounded frame on a flat background; nothing else on stage. */

const SHAPES = HERO_BEATS.map(b => ({ hasMessage: b.message !== null, checks: b.checks.length, hasReply: Boolean(b.reply) }));
const ease = [0.22, 1, 0.36, 1] as const;

export default function StageA() {
  const reducedMotion = Boolean(useReducedMotion());
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { amount: 0.1 });
  const p = usePresenter(SHAPES, { active: inView, reducedMotion });

  const feed = useMemo(() => buildFeed(i => p.reached(i, 'decided')), [p.reached]);
  const books = useMemo(() => booksFrom(HERO_BEATS.filter((_, i) => p.reached(i, 'decided'))), [p.reached]);
  const posted = books.rows.filter(r => r.status === 'posted').reduce((a, r) => a + r.amount, 0);
  const bills = books.rows.filter(r => r.status === 'claimed').length;
  const landing = p.phase === 'decided' || p.phase === 'replied';
  /* once the bot has asked the PM, his cursor clicks Approve before the next beat posts it */
  const approving = p.reached(p.index, 'replied') ? nextApproval(p.index) : null;

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); p.step(); }
  };

  return (
    <div ref={rootRef} onKeyDown={onKey} role="region" aria-label="Example: Site Bot reading one day in a site WhatsApp group" className="text-left">
      <div className="relative overflow-hidden rounded-[22px] ring-1 ring-black/[0.05] lg:[zoom:0.88]">
        <Backdrop />

        <div className="relative flex flex-col items-center gap-8 px-4 py-10 lg:h-[760px] lg:flex-row lg:items-center lg:justify-center lg:gap-16 lg:px-8 lg:py-0 xl:h-[860px] xl:gap-20">
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

          {/* the CRM */}
          <motion.div
            className="relative z-10 w-full max-w-[760px] lg:w-[600px] xl:w-[720px]"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.2, ease }}
          >
            {/* zoomed up inside, so its text sits closer to the phone's in size */}
            <div className="xl:[zoom:1.1]">
              <CrmWindow p={p} feed={feed} landing={landing} posted={posted} waiting={books.pm.length} blocked={books.blocked} bills={bills} approving={approving} />
            </div>
          </motion.div>
        </div>
      </div>

      <Controls p={p} />
    </div>
  );
}
