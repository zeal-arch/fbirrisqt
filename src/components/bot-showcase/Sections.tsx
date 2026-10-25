import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react';
import { ArrowUpRight, Banknote, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { HERO_BEATS, VOLUNTEER_MAILTO, type ChatMessage } from '../../data/botShowcase';
import { BotBubble, MessageBubble } from './ChatParts';
import BotMark from './BotMark';
import Backdrop from './Backdrop';
import PmApprove from './PmApprove';
import { STATUS } from './status';
import wallpaper from '../../assets/chat-wallpaper.webp';

/* Sections 2 to 5, each answering the next question a PM has after the hero:
   2. Will it understand my group?   3. Will it mess up money?
   4. Will my team have to change?   5. What do I do now?
   One idea per section, big type, one product visual, no cards. */

const ease = [0.22, 1, 0.36, 1] as const;
const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.8, ease },
};

const beatOf = (test: (m: ChatMessage) => boolean) => HERO_BEATS.find(b => b.message && test(b.message))!;
const BILL = beatOf(m => m.kind === 'bill');
const VOICE = beatOf(m => m.kind === 'voice');
const ASK = HERO_BEATS.find(b => b.decision.tone === 'ask')!;
const ANSWER = HERO_BEATS[HERO_BEATS.indexOf(ASK) + 1];

export default function Sections() {
  return (
    <div className="bg-[#fdfcfc] font-display text-black">
      <SendSection />
      <MoneySection />
      <TeamSection />
      <PilotSection />
    </div>
  );
}

function Section({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn('mx-auto max-w-7xl px-4 py-24 md:px-8 md:py-36', className)}>{children}</section>;
}

function Heading({ kicker, title, children }: { kicker: string; title: string; children?: ReactNode }) {
  return (
    <motion.div {...reveal} className="max-w-[720px]">
      <p className="text-[13px] font-medium text-black/45">{kicker}</p>
      <h2 className="mt-3 font-display text-[34px] font-normal leading-[1.05] tracking-[-0.04em] min-[810px]:text-[42px] min-[1200px]:text-[52px]">{title}</h2>
      {children && <p className="mt-5 max-w-[540px] text-[17px] leading-[1.35] tracking-[-0.01em] text-black/55 min-[1200px]:text-[19px]">{children}</p>}
    </motion.div>
  );
}

/* ---------- 2. Send it like you always do ---------- */

function SendSection() {
  return (
    <Section>
      <Heading kicker="What it reads" title="Send it like you always do.">
        Nobody on site learns anything new. Site Bot reads what they already send to the group.
      </Heading>

      <div className="mt-16">
        <Row title="It reads the bill." body="16 sheets × ₹2,700 = ₹43,200 from Raju Traders. It matches the purchase Raju mentioned at 8:12 am, so it is posted to Material.">
          {live => <MessageBubble key={String(live)} message={BILL.message!} time={BILL.time} first live={live} />}
        </Row>
        <Row title="It listens, in Hinglish." body="Kitchen carcass done is logged as progress. The ₹15,000 advance for the shutters goes to the PM; it is never paid on its own.">
          {live => <MessageBubble key={String(live)} message={VOICE.message!} time={VOICE.time} first live={live} />}
        </Row>
        <Row title="It asks when it isn’t sure." body="Imran works on two sites, so Site Bot asks which one. He replies “HSR”, and the ₹8,500 is filed against HSR 3BHK.">
          {() => (
            <>
              <MessageBubble message={ASK.message!} time={ASK.time} first />
              <BotBubble text={ASK.reply!.text} time={ASK.time} first />
              <MessageBubble message={ANSWER.message!} time={ANSWER.time} first />
            </>
          )}
        </Row>
      </div>
    </Section>
  );
}

/* One message, as it arrives in the group, beside what Site Bot did with it. The message comes alive (a bill is
   scanned, a voice note plays) once the row scrolls into view. */
function Row({ title, body, children }: { title: string; body: string; children: (live: boolean) => ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  return (
    <motion.div ref={ref} {...reveal} className="grid items-center gap-8 border-t border-black/[0.08] py-12 md:grid-cols-2 md:gap-16 md:py-16">
      <div className="flex justify-center rounded-[28px] px-6 py-10" style={{ backgroundColor: '#efe7dd', backgroundImage: `url(${wallpaper})`, backgroundSize: 'cover' }}>
        <div className="flex w-[240px] flex-col [zoom:1.25] md:[zoom:1.4]">{children(inView)}</div>
      </div>
      <div>
        <p className="flex items-center gap-2 text-[14px] font-medium text-black/60"><BotMark size={20} /> Site Bot</p>
        <h3 className="mt-4 font-display text-[28px] font-normal leading-[1.1] tracking-[-0.03em] md:text-[36px]">{title}</h3>
        <p className="mt-4 max-w-[460px] text-[17px] leading-[1.45] text-black/60">{body}</p>
      </div>
    </motion.div>
  );
}

/* ---------- 3. Money never moves without you ---------- */

const RULES = [
  ['Payments are never auto-approved.', 'Advances and part payments always wait for the PM.'],
  ['The same bill twice is caught.', 'A photo sent again is spotted and not counted twice.'],
  ['Odd prices go to the PM first.', 'Hinges at ₹980 when they usually cost ₹350–450 are flagged, not posted.'],
] as const;

function MoneySection() {
  return (
    <Section className="grid items-center gap-16 lg:grid-cols-2">
      <div>
        <Heading kicker="Money" title="Money never moves without you.">
          Site Bot logs work and bills on its own. Anything that pays someone waits for you, and you approve it in one click.
        </Heading>
        <ol className="mt-12">
          {RULES.map(([rule, why], i) => (
            <motion.li key={rule} {...reveal} transition={{ ...reveal.transition, delay: i * 0.1 }} className="flex gap-5 border-t border-black/[0.08] py-5">
              <span className="pt-1 text-[13px] tabular-nums text-black/35">0{i + 1}</span>
              <span>
                <span className="block text-[19px] tracking-[-0.01em]">{rule}</span>
                <span className="mt-1 block text-[15px] text-black/50">{why}</span>
              </span>
            </motion.li>
          ))}
        </ol>
      </div>
      <motion.div {...reveal}><ApproveDemo /></motion.div>
    </Section>
  );
}

/* The ₹15,000 advance waiting in the CRM: the PM's cursor clicks Approve and it turns green. Replays while visible. */
function ApproveDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.5 });
  const reduced = useReducedMotion();
  const [run, setRun] = useState(0);
  const [approved, setApproved] = useState(false);
  useEffect(() => {
    if (!inView) return;
    setApproved(false);
    const click = window.setTimeout(() => setApproved(true), reduced ? 0 : 1700);
    const again = reduced ? undefined : window.setTimeout(() => setRun(r => r + 1), 5200);
    return () => { window.clearTimeout(click); window.clearTimeout(again); };
  }, [inView, run, reduced]);

  return (
    <div ref={ref} className="flex justify-center rounded-[28px] bg-[#f3f1ec] px-6 py-20">
      <div className="w-full max-w-[460px] rounded-2xl bg-white p-5 shadow-[0_24px_48px_-28px_rgba(40,25,10,0.45)] ring-1 ring-black/[0.06]">
        <p className="text-[12px] text-black/45">firstbriq CRM · HSR 3BHK · waiting for you</p>
        <div className="mt-4 flex items-center gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#e9efe9]" aria-hidden="true"><Banknote className="h-5 w-5 text-black/70" /></span>
          <div className="min-w-0 flex-1">
            <p className="text-[17px] font-medium">Advance to Suresh</p>
            <p className="text-[13px] text-black/50">Kitchen shutters · asked by voice note, 8:30 am</p>
          </div>
          <p className="text-[20px] font-medium tabular-nums tracking-[-0.01em]">₹15,000</p>
        </div>
        <div className="mt-5 flex h-8 items-center justify-end border-t border-black/[0.06] pt-5">
          <AnimatePresence mode="wait" initial={false}>
            {approved ? (
              <motion.span key="done" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={cn('inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium', STATUS.posted.pill)}>
                <CheckCircle2 className="h-4 w-4" /> Approved by Arjun · posted
              </motion.span>
            ) : (
              <motion.span key={'ask' + run} exit={{ opacity: 0 }} className="[zoom:1.2]">
                {inView && <PmApprove />}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ---------- 4. Nothing changes for your team ---------- */

const TEAM = [
  ['Same WhatsApp group.', 'Add Site Bot like any member. Nobody installs anything.'],
  ['No new habits.', 'Supervisors and vendors keep sending bills, voice notes and texts as they do today.'],
  ['Hindi, English, or both.', 'It reads the way your site actually talks, typos and all.'],
] as const;

function TeamSection() {
  return (
    <Section>
      <Heading kicker="Your team" title="Nothing changes for your team." />
      <div className="mt-16 grid gap-10 md:grid-cols-3 md:gap-12">
        {TEAM.map(([line, detail], i) => (
          <motion.div key={line} {...reveal} transition={{ ...reveal.transition, delay: i * 0.1 }} className="border-t border-black pt-6">
            <p className="font-display text-[26px] leading-[1.15] tracking-[-0.03em] md:text-[30px]">{line}</p>
            <p className="mt-3 text-[16px] leading-[1.45] text-black/55">{detail}</p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

/* ---------- 5. The pilot ---------- */

function PilotSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 md:px-8">
      <motion.div {...reveal} className="relative overflow-hidden rounded-[28px] px-6 py-24 text-center md:py-32">
        <Backdrop />
        <div className="relative">
          <p className="text-[13px] font-medium text-black/55">The pilot</p>
          <h2 className="mt-3 font-display text-[38px] font-normal leading-[1.05] tracking-[-0.04em] md:text-[58px]">We’re looking for 5 sites.</h2>
          <p className="mx-auto mt-5 max-w-[460px] text-[18px] leading-[1.4] text-black/65">Two weeks. One WhatsApp group. You can stop anytime.</p>
          <a href={VOLUNTEER_MAILTO} className="group transition-[transform,background-color,box-shadow] duration-200 ease-out hover:-translate-y-px active:translate-y-0 active:scale-[0.97] motion-reduce:transform-none hover:shadow-[0_10px_24px_-10px_rgba(0,0,0,0.5)] mt-10 inline-flex h-12 items-center gap-3 rounded-full bg-black py-1 pl-6 pr-1.5 text-[15px] text-white hover:bg-black/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2">
            Volunteer your site
            <span className="grid h-9 w-9 place-items-center rounded-full bg-white/15 transition-colors duration-200 group-hover:bg-white/25"><ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span>
          </a>
        </div>
      </motion.div>
      <p className="mt-8 text-center text-[12px] text-black/35">Scripted example. Names, shops and amounts are illustrative.</p>
    </section>
  );
}
