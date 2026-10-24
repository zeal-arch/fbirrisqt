import { AnimatePresence, motion } from 'motion/react';

/* Amplemarket-style flow lines: faint curves that start spread out along the left edge of the frame and
   gather into the phone, like the site's messages all ending up in one group. They sit behind the cards.
   Each time a new message arrives, a short bright pulse runs along one of the lines into the phone. */

const COUNT = 11;
const SPREAD = 44; // how far apart the lines still are where they meet the phone

export default function FlowLines({ x1, y1, h, pulseKey, lane }: { x1: number; y1: number; h: number; pulseKey: number | null; lane: number }) {
  const paths = Array.from({ length: COUNT }, (_, i) => {
    const t = i / (COUNT - 1);
    const y0 = -120 + t * (h + 240);
    const yEnd = y1 - SPREAD / 2 + t * SPREAD;
    const c1x = x1 * 0.3;
    const c2x = x1 * 0.62;
    return `M0 ${y0} C${c1x} ${y0 + (yEnd - y0) * 0.55}, ${c2x} ${yEnd}, ${x1 * 0.9} ${yEnd} L${x1} ${yEnd}`;
  });
  const pulseLine = paths[(lane * 4 + 3) % COUNT];

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full [mask-image:linear-gradient(to_right,transparent,#000_5%)]"
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
          initial={{ pathLength: 0.06, pathOffset: 0 }}
          animate={{ pathOffset: 0.94 }}
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
            initial={{ pathLength: 0.12, pathOffset: 0 }}
            animate={{ pathOffset: 0.88 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: 'easeIn' }}
          />
        )}
      </AnimatePresence>
    </svg>
  );
}
