# Site Bot showcase

A single hero page for the WhatsApp site bot, set in Geist (a free grotesk close to summation.com's Bureau Sans).
Beside the headline, the hero moment: a handwritten bill arrives in the site's WhatsApp group and Site Bot scans it,
with what it read appearing next to it. Below, one rounded frame on a flat background plays a whole site day: an iPhone
with the WhatsApp group, and the firstbriq CRM filling in as the bot reads each message (three layouts, picked with
`?design=b` or `?design=c`). Built on the same stack as the firstbriq frontend (Vite, React 19, TypeScript, Tailwind 4,
`motion`, `lucide-react`) so it can be moved in without changes.
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
| `src/components/bot-showcase/Stage.tsx` | Design A: the phone and the CRM side by side, and the Play / Step / Restart controls |
| `src/components/bot-showcase/StageB.tsx` | Design B: the phone at the centre, what comes in from site on the left, what the bot files in the CRM on the right. Open it with `?design=b` |
| `src/components/bot-showcase/StageC.tsx` | Design C: a scroll story. The phone and CRM stay pinned while each scroll step shows one moment of the day. Open it with `?design=c` |
| `src/components/bot-showcase/PmApprove.tsx` | The PM's cursor clicking Approve in the CRM, before an advance is posted |
| `src/components/bot-showcase/status.ts` | The one set of status colours all three designs use |
| `src/components/bot-showcase/BotCard.tsx` | The Site Bot panel inside the CRM: the message, "Ran N checks" and the decision |
| `src/components/bot-showcase/CrmWindow.tsx` | The firstbriq CRM window: project bar, numbers, feed and the bot panel |
| `src/components/bot-showcase/BooksFeed.tsx` | The live "Recently added" books list, and what each beat adds to it |
| `src/components/bot-showcase/BotMark.tsx` | Site Bot's one avatar (firstbriq orange), used in the chat and in the CRM |
| `src/components/bot-showcase/Backdrop.tsx` | The stage background: one flat warm off-white |
| `src/components/bot-showcase/BillHero.tsx` | The hero moment beside the headline: a bill photo in the WhatsApp group being scanned, and what Site Bot read from it |
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
