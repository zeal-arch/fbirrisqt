import type { Tone } from '../../data/botShowcase';
import type { FeedTone } from './BooksFeed';

/* One set of status colours for all three designs:
   green = posted, grey = waiting or handled, orange = needs the PM (the only "look here" colour),
   grey with the amount struck through = duplicate. Orange otherwise stays on the bot's own avatar and name. */

export type Status = 'posted' | 'neutral' | 'pm' | 'duplicate';

export const STATUS: Record<Status, { text: string; pill: string; dot: string; row: string }> = {
  posted: { text: 'text-[#2f6b45]', pill: 'bg-[#eef6f0] text-[#2f6b45]', dot: 'bg-[#2f9e5b]', row: 'bg-[#f3f8f4]' },
  neutral: { text: 'text-black/55', pill: 'bg-black/[0.05] text-black/60', dot: 'bg-black/30', row: 'bg-[#f6f4f1]' },
  pm: { text: 'text-[#b8350f]', pill: 'bg-[#fdf1ea] text-[#b8350f]', dot: 'bg-primary', row: 'bg-[#fdf1ea]' },
  duplicate: { text: 'text-black/45', pill: 'bg-black/[0.05] text-black/55', dot: 'bg-black/25', row: 'bg-[#f6f4f1]' },
};

/* "Live" is activity, not a warning, so it is green. */
export const LIVE_DOT = 'bg-[#2f9e5b]';

export const statusOfDecision = (t: Tone): Status =>
  t === 'posted' ? 'posted' : t === 'pm' ? 'pm' : t === 'blocked' ? 'duplicate' : 'neutral';

export const statusOfFeed = (t: FeedTone): Status =>
  t === 'posted' ? 'posted' : t === 'pm' ? 'pm' : t === 'blocked' ? 'duplicate' : 'neutral';
