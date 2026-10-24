import { useEffect, useRef, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { HERO_BEATS, PEOPLE } from '../../data/botShowcase';
import type { usePresenter } from '../../hooks/usePresenter';
import { BotBubble, MessageBubble, to12 } from './ChatParts';
import wallpaper from '../../assets/chat-wallpaper.webp';

type Presenter = ReturnType<typeof usePresenter>;
const enter = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.25, ease: 'easeOut' as const } };

/* Chat wallpaper image supplied by the team (src/assets/chat-wallpaper.webp). */

const ios = '-apple-system, "SF Pro Text", "Helvetica Neue", Roboto, "Segoe UI", system-ui, sans-serif';
const ink = '#111';

/* An iPhone with a black body and thin outline, a Dynamic Island, and WhatsApp for iOS on screen. */
export default function Phone({ p, reducedMotion }: { p: Presenter; reducedMotion: boolean }) {
  const chatRef = useRef<HTMLDivElement>(null);
  const beat = HERO_BEATS[p.index];

  useEffect(() => {
    const el = chatRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: reducedMotion ? 'auto' : 'smooth' });
  }, [p.index, p.phase, reducedMotion]);

  const chat: ReactNode[] = [];
  let last: string | null = 'suresh';
  HERO_BEATS.forEach((b, i) => {
    if (b.message && p.reached(i, 'message')) {
      chat.push(<motion.div key={'m' + i} className="flex flex-col" {...enter}><MessageBubble message={b.message} time={b.time} first={last !== b.message.from} /></motion.div>);
      last = b.message.from;
    }
    if (b.reply && !b.reply.private && p.reached(i, 'replied')) {
      chat.push(<motion.div key={'r' + i} className="flex flex-col" {...enter}><BotBubble text={b.reply.text} time={b.time} first={last !== 'bot'} /></motion.div>);
      last = 'bot';
    }
  });

  const typing = p.phase === 'typing' && beat.message;
  const who = typing && beat.message ? PEOPLE[beat.message.from].name : null;
  const verb = beat.message?.kind === 'voice' ? 'recording audio…' : beat.message?.kind === 'bill' ? 'sending a photo…' : 'typing…';
  const button = 'absolute w-[4px] rounded-sm bg-[#1a1a1a]';

  return (
    <div className="relative" style={{ fontFamily: ios }}>
      {/* side buttons, outlined like the body */}
      <span className={`${button} -left-[3px] top-[100px] h-[24px]`} style={{ border: `1.5px solid ${ink}` }} aria-hidden="true" />
      <span className={`${button} -left-[3px] top-[140px] h-[40px]`} style={{ border: `1.5px solid ${ink}` }} aria-hidden="true" />
      <span className={`${button} -left-[3px] top-[188px] h-[40px]`} style={{ border: `1.5px solid ${ink}` }} aria-hidden="true" />
      <span className={`${button} -right-[3px] top-[150px] h-[62px]`} style={{ border: `1.5px solid ${ink}` }} aria-hidden="true" />

      {/* white body with a black outline */}
      <div className="relative rounded-[46px] bg-[#0c0c0d] p-[8px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08),0_2px_0_rgba(0,0,0,0.05),0_40px_70px_-30px_rgba(40,25,10,0.55)]" style={{ border: `1.6px solid ${ink}` }}>
        {/* screen */}
        <div className="relative flex h-[560px] w-[264px] flex-col overflow-hidden rounded-[38px] bg-[#f6f5f3]" >
          {/* status bar with Dynamic Island */}
          <div className="relative flex h-[38px] shrink-0 items-center justify-between px-[22px] pt-0.5 text-[12px] font-semibold text-black" aria-hidden="true">
            <span className="tabular-nums tracking-tight">{to12(beat.time).replace(/ (am|pm)/, '')}</span>
            <span className="absolute left-1/2 top-[8px] h-[22px] w-[76px] -translate-x-1/2 rounded-full bg-black" />
            <span className="flex items-center gap-[4px]">
              <svg viewBox="0 0 18 12" width="14" height="9"><rect x="0" y="8" width="3" height="4" rx="1" fill="#000" /><rect x="5" y="5.5" width="3" height="6.5" rx="1" fill="#000" /><rect x="10" y="3" width="3" height="9" rx="1" fill="#000" /><rect x="15" y="0" width="3" height="12" rx="1" fill="#000" /></svg>
              <svg viewBox="0 0 16 12" width="13" height="9"><path d="M8 2.6c2.3 0 4.4.9 6 2.4l1.3-1.3A10.4 10.4 0 0 0 8 .7 10.4 10.4 0 0 0 .7 3.7L2 5c1.6-1.5 3.7-2.4 6-2.4zm0 3.6c1.3 0 2.5.5 3.5 1.3l1.3-1.3a7 7 0 0 0-9.6 0l1.3 1.3c1-.8 2.2-1.3 3.5-1.3zM8 9.6a1.9 1.9 0 0 0-1.4.6L8 11.6l1.4-1.4a1.9 1.9 0 0 0-1.4-.6z" fill="#000" /></svg>
              <span className="relative block h-[10px] w-[20px] rounded-[3px] border border-black/40 p-[1.5px]"><span className="block h-full w-[78%] rounded-[1.5px] bg-black" /></span>
            </span>
          </div>

          {/* WhatsApp for iOS chat header */}
          <div className="flex h-[42px] shrink-0 items-center gap-1.5 border-b border-black/[0.08] bg-[#f6f5f3]/95 px-2">
            <span className="flex shrink-0 items-center" aria-hidden="true">
              <svg viewBox="0 0 12 20" width="9" height="16"><path d="M10 2 2 10l8 8" fill="none" stroke="#007aff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <span className="ml-0.5 text-[13px] text-[#007aff]">12</span>
            </span>
            <span className="grid h-7 w-7 shrink-0 place-items-center overflow-hidden rounded-full bg-[#efe6dc]" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24"><path d="M3 11.5 12 4l9 7.5V20H3z" fill="#D23E12" /><rect x="10" y="14" width="4" height="6" fill="#efe6dc" /><rect x="5.5" y="13" width="3" height="3" fill="#efe6dc" /></svg>
            </span>
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block truncate text-[13px] font-semibold text-black">HSR 3BHK Site</span>
              <span className="block truncate text-[10px] text-[#8a8a8e]">{who ? `${who} is ${verb}` : 'tap here for group info'}</span>
            </span>
            <svg viewBox="0 0 26 18" width="20" height="14" className="shrink-0" aria-hidden="true"><rect x="1" y="2" width="16" height="14" rx="3.5" fill="none" stroke="#007aff" strokeWidth="1.8" /><path d="M17 7.5 24 3.5v11L17 10.5" fill="none" stroke="#007aff" strokeWidth="1.8" strokeLinejoin="round" /></svg>
            <svg viewBox="0 0 24 24" width="17" height="17" className="ml-2 mr-0.5 shrink-0" aria-hidden="true"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z" fill="none" stroke="#007aff" strokeWidth="1.8" strokeLinejoin="round" /></svg>
          </div>

          {/* chat and input bar sit on the wallpaper, which stays put while the chat scrolls (as in WhatsApp) */}
          <div
            className="relative flex min-h-0 flex-1 flex-col"
            style={{ backgroundColor: '#f7f3ea', backgroundImage: `url(${wallpaper})`, backgroundSize: 'cover', backgroundPosition: 'center top' }}
          >
            <div ref={chatRef} className="hide-scrollbar flex flex-1 flex-col overflow-y-auto px-[8px] pb-2 pt-2 text-left">
              <div className="mx-auto mt-1 rounded-full bg-white/95 px-2.5 py-[2px] text-[10px] font-medium text-[#54656f] shadow-[0_1px_0.5px_rgba(11,20,26,0.13)]">Today</div>
              <div className="mx-auto mb-1 mt-2 rounded-[7px] bg-white/90 px-2 py-[4px] text-[9.5px] text-[#54656f] shadow-[0_1px_0.5px_rgba(11,20,26,0.13)]">Arjun added Site Bot</div>
              {/* a couple of earlier messages, so the group already looks busy when the day starts */}
              <MessageBubble time="07:52" first message={{ kind: 'text', from: 'arjun', text: 'Good morning team 🙏 Aaj kitchen aur master bedroom pe kaam hai.' }} />
              <MessageBubble time="07:58" first message={{ kind: 'text', from: 'suresh', text: 'Good morning sir 👍 9 baje tak site pe' }} />
              <AnimatePresence initial={false}>{chat}</AnimatePresence>
            </div>

            {/* WhatsApp for iOS input bar */}
            <div className="flex shrink-0 items-center gap-2 border-t border-black/[0.06] bg-[#f6f5f3]/95 px-2 pb-[22px] pt-[6px] backdrop-blur" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="20" height="20" className="shrink-0"><path d="M12 4v16M4 12h16" stroke="#007aff" strokeWidth="2" strokeLinecap="round" /></svg>
              <span className="flex h-[27px] flex-1 items-center justify-end rounded-full border border-black/[0.12] bg-white px-2">
                <svg viewBox="0 0 24 24" width="15" height="15"><rect x="4" y="3" width="16" height="18" rx="4" fill="none" stroke="#007aff" strokeWidth="1.7" /><path d="M9 9h.01M15 9h.01M8.5 14c1.9 2 5.1 2 7 0" stroke="#007aff" strokeWidth="1.7" strokeLinecap="round" /></svg>
              </span>
              <svg viewBox="0 0 24 24" width="20" height="20" className="shrink-0"><path d="M4 8.5h3l1.8-2.5h6.4L17 8.5h3V19H4z" fill="none" stroke="#007aff" strokeWidth="1.8" strokeLinejoin="round" /><circle cx="12" cy="13.3" r="3.3" fill="none" stroke="#007aff" strokeWidth="1.8" /></svg>
              <svg viewBox="0 0 24 24" width="18" height="18" className="shrink-0"><rect x="9" y="3" width="6" height="11" rx="3" fill="none" stroke="#007aff" strokeWidth="1.8" /><path d="M6 11a6 6 0 0 0 12 0M12 17v4" fill="none" stroke="#007aff" strokeWidth="1.8" strokeLinecap="round" /></svg>
            </div>
          </div>

          {/* home indicator */}
          <span className="absolute bottom-[7px] left-1/2 h-[4px] w-[92px] -translate-x-1/2 rounded-full bg-black" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
