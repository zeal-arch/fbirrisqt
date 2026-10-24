import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { FirstbriqLogo } from '../ui/FirstbriqLogo';
import { VOLUNTEER_MAILTO } from '../../data/botShowcase';
import Stage from './Stage';

/* Amplemarket-style hero: a centred two-line headline, one black button and a quiet text link,
   then the product itself. Colours stay neutral (near-white page, black type). */

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 14, filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] as const },
});

export default function Hero() {
  return (
    <section className="min-h-screen bg-[#fdfcfc] font-display text-black">
      <header className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
        <span className="flex items-center gap-3">
          <FirstbriqLogo className="h-6 w-auto" />
          <span className="h-5 w-px bg-black/15" aria-hidden="true" />
          <span className="text-[15px] font-medium tracking-[-0.01em]">Site Bot</span>
        </span>
        <a href={VOLUNTEER_MAILTO} className="inline-flex h-9 items-center rounded-full bg-black px-4 text-[14px] font-medium text-white transition-colors hover:bg-black/80">
          Volunteer a site
        </a>
      </header>

      {/* summation.com-style intro: left-aligned headline and text, buttons on the left, a pill on the right */}
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-14 text-left md:px-8 md:pt-20">
        <motion.h1 {...fadeUp(0.08)} className="max-w-[760px] font-display text-[34px] font-normal leading-[1.08] tracking-[-0.04em] sm:text-[44px] md:text-[52px]">
          Your site runs on WhatsApp.
          <br />
          Now your books do too.
        </motion.h1>

        <motion.p {...fadeUp(0.16)} className="mt-8 max-w-[540px] text-[16px] leading-[1.45] tracking-[-0.01em] text-black/55">
          Site Bot reads the bills, voice notes and payment requests in your project group, and keeps the books for your PM. When it isn’t sure about money, it asks.
        </motion.p>

        <motion.div {...fadeUp(0.24)} className="mt-12 flex flex-wrap items-center justify-between gap-4">
          <span className="flex flex-wrap items-center gap-3">
            <a href={VOLUNTEER_MAILTO} className="inline-flex h-10 items-center gap-2.5 rounded-full bg-black py-1 pl-5 pr-1 text-[14px] font-normal text-white transition-colors hover:bg-black/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2">
              Volunteer your site
              <span className="grid h-8 w-8 place-items-center rounded-full bg-white/15"><ArrowUpRight className="h-3.5 w-3.5" /></span>
            </a>
            <a href="#stage" className="inline-flex h-10 items-center rounded-full bg-black/[0.05] px-5 text-[14px] text-black transition-colors hover:bg-black/[0.08]">
              Watch a day on site
            </a>
          </span>
        </motion.div>

        <motion.div id="stage" {...fadeUp(0.32)} className="mt-16 scroll-mt-6">
          <Stage />
        </motion.div>

        <p className="mt-8 text-center text-[12px] text-black/35">Scripted example. Names, shops and amounts are illustrative.</p>
      </div>
    </section>
  );
}
