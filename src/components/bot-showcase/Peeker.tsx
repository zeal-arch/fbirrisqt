import { motion } from 'motion/react';

/* A hand-drawn site PM in a hard hat peeking over the top of the books card, like the doodle character
   on amplemarket.com (our own drawing). The head sits behind the card, the hands in front of its edge.
   Mood follows the bot: a smile when things post, a small "o" when something needs the PM. */

export type Mood = 'happy' | 'alert' | 'neutral';
const line = { fill: 'none', stroke: '#111', strokeWidth: 2.2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

export function PeekerHead({ mood, nodKey = -1 }: { mood: Mood; nodKey?: number }) {
  return (
    <motion.svg
      viewBox="0 0 96 86"
      width="96"
      height="86"
      initial={{ y: 70 }}
      whileInView={{ y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 1.4, type: 'spring', stiffness: 160, damping: 14 }}
      aria-hidden="true"
    >
      {/* a quick nod each time something posts */}
      <motion.g key={nodKey} initial={false} animate={nodKey >= 0 ? { y: [0, 5, 0, 3, 0] } : { y: 0 }} transition={{ duration: 0.7, ease: 'easeInOut' }}>
      <motion.g animate={{ rotate: mood === 'alert' ? -6 : [0, 3, 0] }} transition={mood === 'alert' ? { duration: 0.3 } : { duration: 5, repeat: Infinity, ease: 'easeInOut' }} style={{ originX: '48px', originY: '80px' }}>
        {/* face */}
        <path d="M20 48c0 22 12 36 28 36s28-14 28-36" {...line} fill="#fff" />
        <path d="M20 54c-6-2-9 3-7 7s6 5 9 3" {...line} fill="#fff" />
        {/* eyes look left, towards the phone */}
        <circle cx="38" cy="60" r={mood === 'alert' ? 3 : 2.4} fill="#111" />
        <circle cx="56" cy="60" r={mood === 'alert' ? 3 : 2.4} fill="#111" />
        {mood === 'alert' && <path d="M32 51l9-2M51 49l9 2" {...line} strokeWidth={1.8} />}
        {mood === 'happy' && <path d="M38 71c4 4 11 4 15 0" {...line} />}
        {mood === 'neutral' && <path d="M40 72h11" {...line} />}
        {mood === 'alert' && <ellipse cx="46" cy="73" rx="3" ry="3.6" {...line} strokeWidth={1.8} />}
        {/* hard hat */}
        <path d="M18 44c0-24 14-38 30-38s30 14 30 38z" {...line} fill="#fff" />
        <path d="M10 44h76c2 0 3 2 2 4l-2 3H12l-3-3c-1-2 0-4 1-4z" {...line} fill="#fff" />
        <path d="M48 6V2M40 10l3 33M56 10l-3 33" {...line} />
      </motion.g>
      </motion.g>
    </motion.svg>
  );
}

export function PeekerHands() {
  const hand = (x: number) => (
    <g transform={`translate(${x} 0)`}>
      <path d="M2 14c0-8 4-12 11-12s11 4 11 12" {...line} fill="#fff" />
      <path d="M8 4v9M13 3v10M18 4v9" {...line} strokeWidth={1.6} />
    </g>
  );
  return (
    <motion.svg
      viewBox="0 0 110 18"
      width="110"
      height="18"
      initial={{ opacity: 0, y: 6 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 1.5, duration: 0.3 }}
      aria-hidden="true"
    >
      {hand(6)}
      {hand(80)}
    </motion.svg>
  );
}
