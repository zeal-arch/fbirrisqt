import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

/* Briq, Site Bot's mascot: a terracotta brick (with real mortar lines, so it reads as a brick and not a box) in a
   site helmet, waving with one hand and holding a bill in the other. It bobs gently, blinks and waves.
   Drawn as one SVG so it stays sharp from a 40px WhatsApp avatar to a large hero. */

const BRICK = '#D9572B';
const BRICK_DARK = '#B4441F';
const BRICK_LIGHT = '#EE7A49';
const INK = '#221a17';

export default function Briq({ size = 160, className }: { size?: number; className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 220 260"
      width={size}
      height={(size * 260) / 220}
      className={cn('block overflow-visible', className)}
      role="img"
      aria-label="Briq, the Site Bot mascot: a brick in a site helmet, waving and holding a bill"
      animate={{ y: [0, -4, 0] }}
      transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* shadow */}
      <ellipse cx="110" cy="248" rx="56" ry="7" fill="#000" opacity="0.1" />

      {/* legs and feet */}
      <rect x="80" y="198" width="20" height="40" rx="9" fill={BRICK_DARK} />
      <rect x="122" y="198" width="20" height="40" rx="9" fill={BRICK_DARK} />
      <rect x="72" y="228" width="32" height="14" rx="7" fill={BRICK_DARK} />
      <rect x="118" y="228" width="32" height="14" rx="7" fill={BRICK_DARK} />

      {/* waving arm (behind the body), from the left shoulder */}
      <motion.g
        animate={{ rotate: [0, -16, 4, -16, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 2.2, ease: 'easeInOut' }}
        style={{ originX: 1, originY: 1 }}
      >
        <path d="M54 136 C36 126 28 108 32 88" fill="none" stroke={BRICK} strokeWidth="17" strokeLinecap="round" />
        <circle cx="32" cy="82" r="11" fill={BRICK} />
      </motion.g>

      {/* body: a side face for depth, the front face, a lit top edge */}
      <rect x="54" y="64" width="124" height="146" rx="28" fill={BRICK_DARK} />
      <rect x="44" y="60" width="124" height="146" rx="28" fill={BRICK} />
      <rect x="60" y="66" width="92" height="9" rx="4.5" fill={BRICK_LIGHT} opacity="0.7" />

      {/* mortar lines in the lower half: two staggered courses, like a real brick wall */}
      <g stroke="#F6B597" strokeWidth="2.5" strokeLinecap="round" opacity="0.45">
        <path d="M54 154 H158" />
        <path d="M54 180 H158" />
        <path d="M106 154 V180" />
        <path d="M80 180 V202" />
        <path d="M132 180 V202" />
      </g>

      {/* face */}
      <ellipse cx="72" cy="128" rx="8" ry="5" fill="#FF9C8A" opacity="0.55" />
      <ellipse cx="144" cy="128" rx="8" ry="5" fill="#FF9C8A" opacity="0.55" />
      <motion.g
        animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
        transition={{ duration: 4.5, repeat: Infinity, times: [0, 0.9, 0.93, 0.96, 1] }}
        style={{ originY: 0.5 }}
      >
        <ellipse cx="88" cy="106" rx="12" ry="14" fill="#fff" />
        <ellipse cx="128" cy="106" rx="12" ry="14" fill="#fff" />
        <circle cx="90" cy="109" r="6.5" fill={INK} />
        <circle cx="130" cy="109" r="6.5" fill={INK} />
        <circle cx="92.5" cy="106" r="2.2" fill="#fff" />
        <circle cx="132.5" cy="106" r="2.2" fill="#fff" />
      </motion.g>
      <path d="M80 86 Q88 82 96 85" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <path d="M120 85 Q128 82 136 86" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <path d="M97 127 Q108 141 119 127 Z" fill="#3a1a12" />
      <ellipse cx="108" cy="134" rx="5" ry="3" fill="#E8716B" />

      {/* site helmet, tilted */}
      <g transform="rotate(-8 108 58)">
        <path d="M64 60 C64 26 152 26 152 60 Z" fill="#FFF4DF" />
        <path d="M134 34 C146 42 150 52 150 58" fill="none" stroke="#F1DCB4" strokeWidth="5" strokeLinecap="round" />
        <rect x="104" y="30" width="8" height="20" rx="4" fill="#F1DCB4" />
        <rect x="54" y="56" width="110" height="11" rx="5.5" fill="#F6E5C2" />
      </g>

      {/* the bill it holds, and the hand over it */}
      <g transform="rotate(10 186 172)">
        <rect x="168" y="146" width="36" height="48" rx="3" fill="#fff" stroke="#E7DDCF" strokeWidth="1.5" />
        <path d="M174 156 H198 M174 163 H194 M174 170 H198 M174 177 H190" stroke="#C9BFB2" strokeWidth="2" strokeLinecap="round" />
        <path d="M184 186 H198" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
      </g>
      <path d="M166 136 C182 144 186 156 182 168" fill="none" stroke={BRICK} strokeWidth="17" strokeLinecap="round" />
      <circle cx="181" cy="172" r="11" fill={BRICK} />
    </motion.svg>
  );
}
