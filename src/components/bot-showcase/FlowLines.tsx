import { AnimatePresence, motion } from 'motion/react';

/* Amplemarket-style flow lines: faint curves that start spread out along the bot card's right edge (or the
   frame's left edge when the card is hidden) and gather into the phone, like the site's messages all ending up in one group. They sit behind the cards.
   Each time a new message arrives, a short bright pulse runs along one of the lines into the phone. */

const COUNT = 11;
const SPREAD = 44; // how far apart the lines still are where they meet the phone

/* `outward` reverses the travel: pulses run from the gathered end (x1) out to the spread end (x0). */
export default function FlowLines({ x0 = 0, y0a, y0b, x1, y1, pulseKey, lane, outward = false }: { x0?: number; y0a: number; y0b: number; x1: number; y1: number; h: number; pulseKey: number | null; lane: number; outward?: boolean }) {
  const paths = Array.from({ length: COUNT }, (_, i) => {
    const t = i / (COUNT - 1);
    const y0 = y0a + t * (y0b - y0a);
    const yEnd = y1 - SPREAD / 2 + t * SPREAD;
    const span = x1 - x0;
    const c1x = x0 + span * 0.45;
    const c2x = x0 + span * 0.6;
    return `M${x0} ${y0} C${c1x} ${y0}, ${c2x} ${yEnd}, ${x0 + span * 0.92} ${yEnd} L${x1} ${yEnd}`;
  });
  const pulseLine = paths[(lane * 4 + 3) % COUNT];

  return (
    <svg
      className={`pointer-events-none absolute inset-0 h-full w-full ${x0 === 0 ? '[mask-image:linear-gradient(to_right,transparent,#000_5%)]' : ''}`}
      aria-hidden="true"
    >
      {paths.map((d, i) => (
        <motion.path
          key={i}
          d={d}
          fill="none"
          stroke="#1f2937"
          strokeOpacity={0.14}
          strokeWidth={1}
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.6, delay: 0.2 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
        />
      ))}
      {/* quiet ambient traffic, always moving */}
      {[1, 5, 8].map((line, k) => (
        <motion.path
          key={'amb' + line}
          d={paths[line]}
          fill="none"
          stroke="#111"
          strokeOpacity={0.22}
          strokeWidth={1.2}
          strokeLinecap="round"
          initial={{ pathLength: 0.06, pathOffset: outward ? 0.94 : 0 }}
          animate={{ pathOffset: outward ? 0 : 0.94 }}
          transition={{ duration: 4.5 + k * 1.3, delay: 1.5 + k * 1.1, repeat: Infinity, repeatDelay: 1.5 + k, ease: 'easeInOut' }}
        />
      ))}
      <AnimatePresence>
        {pulseKey !== null && (
          <motion.path
            key={pulseKey}
            d={pulseLine}
            fill="none"
            stroke="#111"
            strokeOpacity={0.55}
            strokeWidth={1.6}
            strokeLinecap="round"
            initial={{ pathLength: 0.12, pathOffset: outward ? 0.88 : 0 }}
            animate={{ pathOffset: outward ? 0 : 0.88 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: 'easeIn' }}
          />
        )}
      </AnimatePresence>
    </svg>
  );
}
