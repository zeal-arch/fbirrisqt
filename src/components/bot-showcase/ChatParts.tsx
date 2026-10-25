import { useEffect, useState } from 'react';
import { animate, motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { PEOPLE, type Bill, type ChatMessage } from '../../data/botShowcase';
import BotMark from './BotMark';

/* WhatsApp (Android, light theme) message pieces, drawn to match the real app:
   Roboto, 7px bubble radius with a tail on the first bubble of a run, inline timestamps, blue ticks. */

const to12 = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`;
};

const IN = '#ffffff';
const OUT = '#d9fdd3';
const bubbleShadow = 'shadow-[0_1px_0.5px_rgba(11,20,26,0.13)]';

function Tail({ out, color }: { out: boolean; color: string }) {
  return (
    <svg
      viewBox="0 0 8 13"
      width="8"
      height="13"
      className={cn('absolute top-0', out ? '-right-[7px]' : '-left-[7px] -scale-x-100')}
      aria-hidden="true"
    >
      <path d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z" fill={color} />
    </svg>
  );
}

function Ticks() {
  return (
    <svg viewBox="0 0 16 11" width="16" height="11" className="ml-0.5 inline-block" aria-label="Read">
      <path d="M11.07.65 4.75 6.97 2.46 4.68l-.95.95 3.24 3.24 7.27-7.27zM14.54.65 8.22 6.97l-.6-.6-.95.95 1.55 1.55 7.27-7.27z" fill="#53bdeb" />
    </svg>
  );
}

function Meta({ time, out, overlay }: { time: string; out?: boolean; overlay?: boolean }) {
  return (
    <span className={cn('float-right ml-2.5 mt-[4px] -mb-[3px] flex items-center gap-0.5 text-[9.5px] leading-none', overlay ? 'text-white' : 'text-[#667781]')}>
      {to12(time)}
      {out && <Ticks />}
    </span>
  );
}

/* A green tick badge, as WhatsApp shows next to verified business accounts. */
function Verified() {
  return (
    <svg viewBox="0 0 18 18" width="13" height="13" aria-label="Verified business">
      <path d="M9 0l2.2 1.6 2.7-.2.8 2.6 2.3 1.5-.9 2.5.9 2.5-2.3 1.5-.8 2.6-2.7-.2L9 18l-2.2-1.6-2.7.2-.8-2.6-2.3-1.5.9-2.5-.9-2.5L3.3 4l.8-2.6 2.7.2z" fill="#25D366" />
      <path d="M5.2 9.2l2.4 2.4 5-5" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function WaveBars({ seed, played }: { seed: number; played: number }) {
  return (
    <span className="relative flex h-[26px] flex-1 items-center gap-[2px]" aria-hidden="true">
      {Array.from({ length: 22 }, (_, k) => {
        const v = 3 + Math.abs(Math.sin(seed * 7.3 + k * 1.7) * 13 + Math.cos(k * 0.9 + seed) * 4);
        return <i key={k} className="block w-[2.5px] rounded-full" style={{ height: Math.min(22, v), background: k / 22 < played ? '#00a884' : '#b7c0c5' }} />;
      })}
      <span className="absolute -ml-[6px] h-3 w-3 rounded-full bg-[#00a884]" style={{ left: `${played * 100}%` }} />
    </span>
  );
}

/* Site Bot reading the bill: a box drawn around one thing it read. */
function ReadBox({ delay }: { delay: number }) {
  return (
    <motion.span
      aria-hidden="true"
      className="pointer-events-none absolute -inset-[2px] rounded-[3px] ring-[1.5px] ring-primary"
      initial={{ opacity: 0, scale: 1.12 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.3, ease: 'easeOut' }}
    />
  );
}

/* A phone photo of a handwritten bill on a wooden table. With `scan`, Site Bot reads it: a light sweeps down
   the photo, then the shop, the items and the total are boxed one by one. */
export function BillPhoto({ bill, scan = false }: { bill: Bill; scan?: boolean }) {
  return (
    <div
      className="relative h-[196px] w-[168px] overflow-hidden rounded-[6px]"
      style={{
        background:
          'radial-gradient(ellipse at 70% 15%,rgba(255,240,210,.35),transparent 55%),repeating-linear-gradient(97deg,rgba(0,0,0,.07) 0 2px,transparent 2px 11px),linear-gradient(160deg,#8a6240,#6e4b2f 55%,#4f341f)',
      }}
      role="img"
      aria-label={`Photo of a handwritten bill from ${bill.shop}, total ₹${bill.total}`}
    >
      <div
        className="absolute left-[16px] top-[11px] w-[136px] -rotate-[4deg] bg-[#fbf8ef] px-2.5 py-2 font-hand text-[9.5px] leading-[14px] text-[#1e3a8a] shadow-[0_10px_18px_rgba(0,0,0,.5)]"
        style={{ backgroundImage: 'repeating-linear-gradient(transparent 0 13px,#cfdcec 13px 14px)' }}
      >
        <div className="relative text-center font-bold tracking-wide text-[#111]">{bill.shop.toUpperCase()}{scan && <ReadBox delay={1.15} />}</div>
        <div className="mb-1 text-center font-sans text-[8px] leading-[10px] text-neutral-500">{bill.address}</div>
        <div className="flex justify-between text-[10px] text-neutral-600"><span>No. {bill.number}</span><span>Dt. 21/10</span></div>
        <div className="relative">{bill.lines.map(l => <div key={l}>{l}</div>)}{scan && <ReadBox delay={1.4} />}</div>
        <div className="relative mt-1 border-t border-[#1e3a8a] font-bold">Total ₹ {bill.total}/-{scan && <ReadBox delay={1.65} />}</div>
        <div className="absolute bottom-2 right-3 -rotate-12 text-[13px] opacity-80">{bill.shop.split(' ')[0]}</div>
      </div>
      {/* lens vignette and the slight blur of a phone photo */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,.35))]" />
      <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/45 to-transparent" />
      {scan && (
        <>
          {/* the scanning light */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-14"
            style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0.35) 80%, rgba(255,255,255,0.95) 86%, rgba(255,255,255,0) 90%)' }}
            initial={{ y: -56, opacity: 0 }}
            animate={{ y: [-56, 196], opacity: [0, 1, 1, 0] }}
            transition={{ delay: 0.2, duration: 1.0, ease: 'easeInOut', opacity: { delay: 0.2, duration: 1.0, times: [0, 0.1, 0.85, 1] } }}
          />
          {/* what it read, once the boxes are drawn */}
          <motion.span
            className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-full bg-white/95 py-0.5 pl-0.5 pr-1.5 font-sans text-[9.5px] font-medium text-[#111b21] shadow-sm"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.0, duration: 0.3 }}
          >
            <BotMark size={12} /> Read · ₹{bill.total}
          </motion.span>
        </>
      )}
    </div>
  );
}

/* A voice note. With `live` it plays once and its transcript types out underneath, as WhatsApp shows
   voice-message transcripts. */
function VoiceNote({ message, time, live }: { message: Extract<ChatMessage, { kind: 'voice' }>; time: string; live: boolean }) {
  const p = PEOPLE[message.from];
  const [played, setPlayed] = useState(0);
  useEffect(() => {
    if (!live) { setPlayed(0); return; }
    const c = animate(0, 1, { duration: 1.6, ease: 'linear', onUpdate: setPlayed });
    return () => c.stop();
  }, [live]);
  const words = message.transcript.split(' ');

  return (
    <div className="w-[190px]">
      <div className="flex items-center gap-2.5 pt-0.5">
        <span className="relative grid h-[32px] w-[32px] shrink-0 place-items-center rounded-full text-[13px] font-medium text-white" style={{ background: p.color }}>
          {p.name.charAt(0)}
          <svg viewBox="0 0 12 18" width="10" height="15" className="absolute -bottom-0.5 -right-0.5" aria-hidden="true">
            <path d="M6 12a3 3 0 0 0 3-3V3a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3h-1.6A3.4 3.4 0 0 1 6 12.4 3.4 3.4 0 0 1 2.6 9H1a5 5 0 0 0 4.2 4.9V17h1.6v-3.1A5 5 0 0 0 11 9z" fill="#00a884" stroke="#fff" strokeWidth=".6" />
          </svg>
        </span>
        <svg viewBox="0 0 24 24" width="20" height="20" className="shrink-0" aria-hidden="true">
          {played > 0 && played < 1
            ? <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="#8696a0" />
            : <path d="M8 5.1v13.8a.8.8 0 0 0 1.2.7l10.6-6.9a.8.8 0 0 0 0-1.4L9.2 4.4A.8.8 0 0 0 8 5.1z" fill="#8696a0" />}
        </svg>
        <WaveBars seed={message.duration.length + message.from.length} played={played} />
      </div>
      <div className="mt-0.5 flex justify-between pl-[42px] text-[9.5px] text-[#667781]">
        <span>{message.duration}</span>
        <span>{to12(time)}</span>
      </div>
      {/* the transcript, word by word while it plays */}
      <p className="mt-1 border-t border-black/[0.06] pt-1 text-[12px] leading-[16px] text-[#111b21]">
        {words.map((w, i) => (
          <motion.span key={i} initial={live ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={{ delay: 0.25 + i * 0.09, duration: 0.2 }}>
            {w}{' '}
          </motion.span>
        ))}
      </p>
    </div>
  );
}

/* `live`: this is the message Site Bot is reading right now (a bill gets scanned, a voice note plays). */
export function MessageBubble({ message, time, first, live = false }: { message: ChatMessage; time: string; first: boolean; live?: boolean }) {
  const p = PEOPLE[message.from];
  const out = message.from === 'arjun';
  const color = out ? OUT : IN;
  const photo = message.kind === 'bill';

  return (
    <div className={cn('relative max-w-[85%]', out ? 'self-end' : 'self-start', first ? 'mt-1.5' : 'mt-0.5')}>
      {first && <Tail out={out} color={color} />}
      <div
        className={cn('rounded-[7.5px] text-[12.5px] leading-[16.5px] text-[#111b21]', bubbleShadow, first && (out ? 'rounded-tr-none' : 'rounded-tl-none'), photo ? 'p-[3px]' : 'px-[7px] pb-[5px] pt-[4px]')}
        style={{ background: color }}
      >
        {!out && first && (
          <div className={cn('text-[11.5px] font-medium leading-[15px]', photo && 'px-1 pb-0.5')} style={{ color: p.color }}>
            {p.name}
          </div>
        )}

        {message.kind === 'text' && (
          <span className="break-words">
            {message.text}
            <Meta time={time} out={out} />
          </span>
        )}

        {message.kind === 'voice' && <VoiceNote message={message} time={time} live={live} />}

        {photo && (
          <div className="relative">
            <BillPhoto bill={message.bill} scan={live} />
            <span className="absolute bottom-1.5 right-2 flex items-center text-[9.5px] text-white">{to12(time)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function BotBubble({ text, time, first }: { text: string; time: string; first: boolean }) {
  return (
    <div className={cn('relative max-w-[85%] self-start', first ? 'mt-1.5' : 'mt-0.5')}>
      {first && <Tail out={false} color={IN} />}
      <div className={cn('rounded-[7.5px] bg-white px-[7px] pb-[5px] pt-[4px] text-[12.5px] leading-[16.5px] text-[#111b21]', bubbleShadow, first && 'rounded-tl-none')}>
        {first && (
          <div className="flex items-center gap-1 text-[11.5px] font-medium leading-[15px] text-primary">
            <BotMark size={13} /> firstbriq Site Bot <Verified />
          </div>
        )}
        <span className="break-words">
          {text}
          <Meta time={time} />
        </span>
      </div>
    </div>
  );
}

export { to12 };
