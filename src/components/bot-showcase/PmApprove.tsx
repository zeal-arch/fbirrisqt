import { motion } from 'motion/react';
import { PEOPLE } from '../../data/botShowcase';

/* The PM deciding in the CRM: Reject and Approve buttons, and a cursor with his name that glides in
   and clicks Approve. It shows that money only moves when a person says yes. Plays once on mount, in about
   1.5 seconds; the item turns green when the next beat applies the approval. */

const ease = [0.22, 1, 0.36, 1] as const;

export default function PmApprove() {
  const pm = PEOPLE.arjun;
  return (
    <span className="relative inline-flex items-center gap-1">
      <span className="inline-flex h-6 items-center rounded-full px-2 text-[11px] text-black/50 ring-1 ring-black/10">Reject</span>
      <span className="relative">
        <motion.span
          className="relative inline-flex h-6 items-center rounded-full bg-black px-2.5 text-[11px] font-medium text-white"
          animate={{ scale: [1, 1, 0.88, 1] }}
          transition={{ duration: 1.6, times: [0, 0.72, 0.78, 0.88] }}
        >
          Approve
          {/* the click */}
          <motion.span
            aria-hidden="true"
            className="absolute inset-0 rounded-full ring-2 ring-black/35"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0, 0.9, 0], scale: [1, 1, 1, 1.7] }}
            transition={{ duration: 1.6, times: [0, 0.74, 0.78, 1] }}
          />
        </motion.span>

        {/* the PM's cursor; its tip lands on the left part of Approve, so its name tag stays inside the card */}
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute left-[30%] top-1/2 z-20 flex items-start"
          initial={{ x: -60, y: 40, opacity: 0 }}
          animate={{ x: [-60, -60, 0], y: [40, 40, 0], opacity: [0, 1, 1] }}
          transition={{ duration: 1.1, times: [0, 0.15, 1], ease }}
        >
          <svg width="14" height="16" viewBox="0 0 14 16" className="-ml-px -mt-px drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]">
            <path d="M1 1l11 6.2-4.9 1.1L5 13z" fill={pm.color} stroke="#fff" strokeWidth="1.2" strokeLinejoin="round" />
          </svg>
          <span className="-ml-0.5 mt-3 whitespace-nowrap rounded-full px-1.5 py-[1px] text-[10px] font-medium text-white" style={{ background: pm.color }}>
            {pm.name}
          </span>
        </motion.span>
      </span>
    </span>
  );
}
