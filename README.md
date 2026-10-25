# Site Bot showcase

A single hero page for the WhatsApp site bot, mixing amplemarket.com and summation.com, set in Geist (a free
grotesk close to Summation's Bureau Sans). Below a centred headline, one large rounded frame on a soft backdrop in
firstbriq's warm brand tints holds two things: an iPhone playing one site day in a WhatsApp group, and the firstbriq CRM,
a big window with the project's numbers, a live "Recently added" feed and the Site Bot panel showing what it read and the checks it ran. Faint lines flow from the site into the phone and from the phone into the CRM, a chip
flies from the chat into the CRM when the bot decides, and a hand-drawn PM peeks over the CRM. Built on the same stack as the firstbriq
frontend (Vite, React 19, TypeScript, Tailwind 4, `motion`, `lucide-react`) so it can be moved in without changes.
Everything on it is a scripted example; no real AI or WhatsApp account is connected.

## Run it

```bash
npm install
npm run dev      # http://localhost:5174
npm run build    # static site in dist/
```

## What's where

| Path | What it is |
|---|---|
| `src/pages/BotShowcase.tsx` | The page |
| `src/components/bot-showcase/Hero.tsx` | Header, headline, call to action |
| `src/components/bot-showcase/Stage.tsx` | The frame and layout, the callout line, the flying chip and the Play / Step / Restart controls |
| `src/components/bot-showcase/StageB.tsx` | Design B: the phone at the centre, what comes in from site on the left, what the bot files in the CRM on the right. Open it with `?design=b` |
| `src/components/bot-showcase/StageC.tsx` | Design C: a scroll story. The phone and CRM stay pinned while each scroll step shows one moment of the day. Open it with `?design=c` |
| `src/components/bot-showcase/PmApprove.tsx` | The PM's cursor clicking Approve in the CRM, before an advance is posted |
| `src/components/bot-showcase/status.ts` | The one set of status colours all three designs use |
| `src/components/bot-showcase/BotCard.tsx` | The Site Bot panel inside the CRM: the message, "Ran N checks" and the decision |
| `src/components/bot-showcase/CrmWindow.tsx` | The firstbriq CRM window: project bar, numbers, feed and the bot panel |
| `src/components/bot-showcase/BooksFeed.tsx` | The live "Recently added" books list, and what each beat adds to it |
| `src/components/bot-showcase/Peeker.tsx` | The hand-drawn PM peeking over the list (our own line art) |
| `src/components/bot-showcase/BotMark.tsx` | Site Bot's one avatar (firstbriq orange), used in the chat and in the CRM |
| `src/components/bot-showcase/Backdrop.tsx` | The stage background: cream base, the film-grain texture and a spotlight behind the phone |
| `src/components/bot-showcase/NoiseTexture.tsx`, `src/lib/film-grain.ts`, `src/lib/grain.worker.ts` | Film grain with warm colour drifting through it, adapted from `my_website`'s NoiseTexture |
| `src/components/bot-showcase/FlowLines.tsx` | Faint lines from the left edge into the phone, and from the phone into the CRM, with a pulse per event |
| `src/components/bot-showcase/Phone.tsx` | An iPhone running WhatsApp for iOS (light theme), on the chat wallpaper in `src/assets/chat-wallpaper.webp` |
| `src/components/bot-showcase/ChatParts.tsx` | WhatsApp-style bubbles, voice notes, bill photos |
| `src/data/botShowcase.ts` | The scripted day and the call-to-action link. Edit text here |
| `src/hooks/usePresenter.ts` | Plays the scripted beats |

## Before sharing

- Set the product team's address in `VOLUNTEER_MAILTO` (`src/data/botShowcase.ts`). It currently opens an email with no recipient.

## Moving it into the firstbriq frontend

1. Copy `src/components/bot-showcase/`, `src/data/botShowcase.ts`, `src/hooks/usePresenter.ts` and `src/pages/BotShowcase.tsx` into the same paths.
2. In `App.tsx`, add a lazy route: `<Route path="/site-bot" element={<BotShowcase />} />`.
3. In the frontend's `index.css`, add `Geist` (300 to 700), `Roboto` (400, 500) and `Kalam` to the Google Fonts import, and `--font-display` and `--font-hand` to the `@theme` block (see this project's `src/index.css`). Geist is the page font, Roboto is the fallback font inside the phone, Kalam draws the handwritten bills.

`lib/utils.ts` and `components/ui/FirstbriqLogo.tsx` are copies of the frontend's own files, so they don't need moving.
