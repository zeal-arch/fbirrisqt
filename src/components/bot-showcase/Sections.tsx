import { motion } from 'motion/react';
import { VOLUNTEER_MAILTO } from '../../data/botShowcase';
import ArrowSwap from './ArrowSwap';
import Backdrop from './Backdrop';
import Mascot from './Mascot';

/* Below the hero: the pilot call to action, with Briq waving, and the scripted-example note. */

const ease = [0.22, 1, 0.36, 1] as const;

export default function Sections() {
  return (
    <div className="bg-[#fdfcfc] font-display text-black">
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-24 md:px-8 md:pt-32">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease }}
          className="relative overflow-hidden rounded-[28px] px-6 py-20 text-center md:py-28"
        >
          <Backdrop />
          <div className="relative">
            <Mascot size={170} className="mx-auto" />
            <p className="mt-6 text-[13px] font-medium text-black/55">The pilot</p>
            <h2 className="mt-3 font-display text-[38px] font-normal leading-[1.05] tracking-[-0.04em] md:text-[58px]">We’re looking for 5 sites.</h2>
            <p className="mx-auto mt-5 max-w-[460px] text-[18px] leading-[1.4] text-black/65">Two weeks. One WhatsApp group. You can stop anytime.</p>
            <a href={VOLUNTEER_MAILTO} className="group mt-10 inline-flex h-12 items-center gap-3 rounded-full bg-black py-1 pl-6 pr-1.5 text-[15px] text-white transition-colors hover:bg-black/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2">
              Volunteer your site
              <span className="grid h-9 w-9 place-items-center rounded-full bg-white/15 transition-colors duration-200 group-hover:bg-white/25"><ArrowSwap className="h-4 w-4" /></span>
            </a>
          </div>
        </motion.div>
        <p className="mt-8 text-center text-[12px] text-black/35">Scripted example. Names, shops and amounts are illustrative.</p>
      </section>
    </div>
  );
}
