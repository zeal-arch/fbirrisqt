/* Content for the Site Bot showcase page.
   Everything here is a scripted example: names, shops and amounts are illustrative.
   The messages come from the full interactive demo (../bot-demo.html), trimmed for the hero. */

import surabhiBill from '../assets/bills/surabhi-hardwares.webp';

export type PersonId = 'arjun' | 'suresh' | 'raju' | 'imran' | 'manju' | 'deepak' | 'rao';

export interface Person {
  name: string;
  role: string;
  color: string;
}

export const PEOPLE: Record<PersonId, Person> = {
  arjun: { name: 'Arjun', role: 'Project manager', color: '#075491' },
  suresh: { name: 'Suresh', role: 'Carpenter', color: '#b26a00' },
  raju: { name: 'Raju', role: 'Surabhi Hardwares', color: '#1f7a4a' },
  imran: { name: 'Imran', role: 'Electrician', color: '#c8372d' },
  manju: { name: 'Manju', role: 'Sri Lakshmi Tiles', color: '#0f7a8a' },
  deepak: { name: 'Deepak', role: 'Deepak Hardware', color: '#7a6420' },
  rao: { name: 'Mrs. Rao', role: 'Homeowner', color: '#b3306b' },
};

export interface Bill {
  /* a real photo of the bill; without one, the bill is drawn */
  photo?: string;
  shop: string;
  address: string;
  number: string;
  lines: string[];
  total: string;
}

export type ChatMessage =
  | { kind: 'text'; from: PersonId; text: string }
  | { kind: 'voice'; from: PersonId; duration: string; transcript: string; language: string; english: string }
  | { kind: 'bill'; from: PersonId; bill: Bill };

/* How a decision looks on the page. */
export type Tone = 'posted' | 'claimed' | 'pm' | 'ask' | 'blocked' | 'summary';

export type RowStatus = 'claimed' | 'posted' | 'needs-pm';

export type BookOp =
  | { type: 'row'; id: string; vendor: string; item: string; amount: number; status: RowStatus }
  | { type: 'status'; id: string; status: RowStatus }
  | { type: 'pm'; id: string; title: string; detail: string; amount: number | null }
  | { type: 'progress'; id: string; text: string; by: string }
  | { type: 'blocked'; id: string; amount: number }
  /* the PM approves an item that was waiting for him; it is then posted */
  | { type: 'approve'; id: string };

export interface Beat {
  time: string;
  caption: string;
  message: ChatMessage | null;
  /* What the bot checks, shown one by one. ok=false marks the check that changed the decision. */
  checks: { text: string; ok: boolean }[];
  decision: { label: string; tone: Tone };
  ops: BookOp[];
  reply?: { text: string; private?: boolean };
  summary?: string[];
}

const RAJU_BILL: Bill = {
  photo: surabhiBill,
  shop: 'Surabhi Hardwares',
  address: 'Plywood · Laminates · HSR Layout',
  number: '1184',
  lines: ['12mm ply', '7 No × 500 + GST'],
  total: '4,130',
};

/* The hero's live example: one site group, one working day. */
export const HERO_BEATS: Beat[] = [
  {
    time: '08:12',
    caption: 'A purchase, mentioned in passing',
    message: { kind: 'text', from: 'raju', text: 'Bhai 7 sheet 12mm ply bhej diya HSR site pe, 500 rate, GST ke saath 4130. Bill shaam ko bhejta hu' },
    checks: [
      { text: 'Plywood purchase for HSR 3BHK', ok: true },
      { text: '7 × 500 + 18% GST = 4,130', ok: true },
      { text: 'No bill yet', ok: false },
    ],
    decision: { label: 'Claimed · waiting for bill', tone: 'claimed' },
    ops: [{ type: 'row', id: 'PUR-301', vendor: 'Surabhi Hardwares', item: '12mm ply · 7 sheets', amount: 4130, status: 'claimed' }],
    reply: { text: 'Noted ✔ 7 sheets 12mm ply, ₹4,130 (Surabhi Hardwares). Bill aane par final karenge.' },
  },
  {
    time: '08:30',
    caption: 'A voice note with two things in it',
    message: {
      kind: 'voice', from: 'suresh', duration: '0:23',
      transcript: 'Sir kitchen ka carcass ho gaya, kal se shutter lagayenge, pandrah hazaar advance chahiye',
      language: 'Hindi-English',
      english: 'Kitchen carcass is done, shutters start tomorrow, need ₹15,000 advance',
    },
    checks: [
      { text: 'Voice note transcribed (Hindi-English)', ok: true },
      { text: 'Progress: kitchen carcass done', ok: true },
      { text: 'Payment request: never auto-approved', ok: false },
    ],
    decision: { label: 'Progress logged · advance sent to PM', tone: 'pm' },
    ops: [
      { type: 'progress', id: 'PRG-88', text: 'Kitchen · carcass done', by: 'Suresh' },
      { type: 'pm', id: 'RV-11', title: 'Advance to Suresh', detail: 'For kitchen shutters', amount: 15000 },
    ],
    reply: { text: 'Suresh asks ₹15,000 advance for kitchen shutters → Approve / Reject', private: true },
  },
  {
    time: '08:41',
    caption: 'The PM approves, in one click',
    message: null,
    checks: [],
    decision: { label: 'Approved by Arjun · ₹15,000 posted', tone: 'posted' },
    ops: [{ type: 'approve', id: 'RV-11' }],
    reply: { text: 'Suresh ji, ₹15,000 advance Arjun sir ne approve kar diya ✔' },
  },
  {
    time: '10:02',
    caption: 'Not sure which site, so it asks',
    message: { kind: 'text', from: 'imran', text: 'wire ka 8500 hua, bill bhej raha hu' },
    checks: [
      { text: 'Imran, electrician', ok: true },
      { text: 'Works on 2 sites: project unclear', ok: false },
    ],
    decision: { label: 'Asked one short question', tone: 'ask' },
    ops: [],
    reply: { text: 'Imran ji, ye kaunse site ka hai? 1) HSR 3BHK  2) Whitefield villa' },
  },
  {
    time: '10:04',
    caption: 'The answer completes the entry',
    message: { kind: 'text', from: 'imran', text: 'HSR' },
    checks: [
      { text: 'Answer to the bot’s question', ok: true },
      { text: 'Project: HSR 3BHK', ok: true },
    ],
    decision: { label: 'Claimed · waiting for bill', tone: 'claimed' },
    ops: [{ type: 'row', id: 'PUR-303', vendor: 'Imran · electrician', item: 'Electrical wire', amount: 8500, status: 'claimed' }],
    reply: { text: 'Thank you ✔ ₹8,500 wire noted for HSR 3BHK.' },
  },
  {
    time: '12:40',
    caption: 'The bill arrives and matches',
    message: { kind: 'bill', from: 'raju', bill: RAJU_BILL },
    checks: [
      { text: 'Bill read: 7 × 500 + GST = 4,130', ok: true },
      { text: 'Matches the 08:12 claim', ok: true },
      { text: 'Normal rate · under ₹50,000', ok: true },
    ],
    decision: { label: 'Posted automatically', tone: 'posted' },
    ops: [{ type: 'status', id: 'PUR-301', status: 'posted' }],
    reply: { text: 'Bill received ✔ ₹4,130 entered (Surabhi Hardwares).' },
  },
  {
    time: '12:41',
    caption: 'The same bill, sent twice',
    message: { kind: 'bill', from: 'raju', bill: RAJU_BILL },
    checks: [
      { text: 'Same photo as 12:40', ok: false },
      { text: 'Not counted again', ok: true },
    ],
    decision: { label: 'Duplicate blocked', tone: 'blocked' },
    ops: [{ type: 'blocked', id: 'DUP-1', amount: 4130 }],
    reply: { text: 'Ye bill pehle hi note ho gaya hai ✔' },
  },
  {
    time: '14:05',
    caption: 'A price far above usual',
    message: { kind: 'text', from: 'deepak', text: 'HSR site: Hettich soft-close hinges 40 pcs @ 980 = 39,200' },
    checks: [
      { text: '40 × 980 = 39,200', ok: true },
      { text: 'Usual rate is ₹350–450', ok: false },
    ],
    decision: { label: 'Unusual price · sent to PM', tone: 'pm' },
    ops: [
      { type: 'row', id: 'PUR-304', vendor: 'Deepak Hardware', item: 'Hettich hinges · 40 pcs', amount: 39200, status: 'needs-pm' },
      { type: 'pm', id: 'RV-13', title: 'Hinges at ₹980 each', detail: 'Usual ₹350–450', amount: 39200 },
    ],
    reply: { text: 'Hettich hinges at ₹980/pc (usual ₹350–450). Total ₹39,200 → please check.', private: true },
  },
  {
    time: '14:30',
    caption: 'The homeowner asks for a change',
    message: { kind: 'text', from: 'rao', text: 'Arjun ji, master bedroom wardrobe mein loft bhi chahiye. Possible hai?' },
    checks: [
      { text: 'From the homeowner', ok: true },
      { text: 'Scope change: the PM decides', ok: false },
    ],
    decision: { label: 'Change request sent to PM', tone: 'pm' },
    ops: [{ type: 'pm', id: 'RV-14', title: 'Wardrobe loft', detail: 'Master bedroom · needs a quote', amount: null }],
    reply: { text: 'Noted 🙏 Arjun sir will confirm the loft cost and timeline.' },
  },
  {
    time: '19:30',
    caption: 'The PM’s day, already done',
    message: null,
    checks: [],
    decision: { label: 'Daily summary sent to the PM', tone: 'summary' },
    ops: [],
    summary: [
      '21 messages read · 0 typed by you',
      '₹19,130 posted · 1 duplicate blocked',
      '2 decisions waiting: hinges, loft',
      'Bill still missing: Imran’s wire (₹8,500)',
    ],
  },
];

/* ---------- books: the project ledger the hero fills in ---------- */

export interface BookRow { id: string; vendor: string; item: string; amount: number; status: RowStatus }
export interface PmItem { id: string; title: string; detail: string; amount: number | null }
export interface Books {
  rows: BookRow[];
  pm: PmItem[];
  progress: { id: string; text: string; by: string }[];
  blocked: number;
}

export function booksFrom(beats: Beat[]): Books {
  const books: Books = { rows: [], pm: [], progress: [], blocked: 0 };
  for (const beat of beats) {
    for (const op of beat.ops) {
      if (op.type === 'row') books.rows.push({ id: op.id, vendor: op.vendor, item: op.item, amount: op.amount, status: op.status });
      else if (op.type === 'status') books.rows = books.rows.map(r => (r.id === op.id ? { ...r, status: op.status } : r));
      else if (op.type === 'pm') books.pm.push({ id: op.id, title: op.title, detail: op.detail, amount: op.amount });
      else if (op.type === 'progress') books.progress.push({ id: op.id, text: op.text, by: op.by });
      else if (op.type === 'approve') {
        const item = books.pm.find(x => x.id === op.id);
        books.pm = books.pm.filter(x => x.id !== op.id);
        if (item && item.amount !== null) books.rows.push({ id: op.id, vendor: item.title, item: item.detail, amount: item.amount, status: 'posted' });
      } else books.blocked += op.amount;
    }
  }
  return books;
}

/* The item a PM decision is about, by its id. */
export function pmItem(id: string) {
  for (const b of HERO_BEATS) for (const o of b.ops) if (o.type === 'pm' && o.id === id) return o;
  return undefined;
}

/* While beat `index` shows its reply, the item the next beat approves (the PM is about to click Approve). */
export function nextApproval(index: number): string | null {
  const op = HERO_BEATS[index + 1]?.ops.find(o => o.type === 'approve');
  return op ? op.id : null;
}

export const inr = (n: number) => '₹' + n.toLocaleString('en-IN');

/* Where the call to action goes. Add the product team's address before sharing the page. */
export const VOLUNTEER_MAILTO =
  'mailto:?subject=' + encodeURIComponent('Site Bot pilot: I can volunteer a site') +
  '&body=' + encodeURIComponent('Site name:\nProject manager:\nGroup size:\n');
