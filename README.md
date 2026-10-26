# Site Bot showcase

A single hero page for the WhatsApp site bot, set in Geist (a free grotesk close to summation.com's Bureau Sans).
Below the headline, the product plays one site day: a script line, an iPhone with the site's WhatsApp group, and what
Site Bot files in the firstbriq CRM. The pilot call to action follows, with Briq, the bot's mascot. Built on the same stack as the firstbriq frontend (Vite, React 19, TypeScript, Tailwind 4,
`motion`, `lucide-react`; plus `three`, `@react-three/fiber` and `@react-three/drei` for the 3D mascot) so it can be moved in without changes.
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
| `src/components/bot-showcase/Stage.tsx` | The hero stage: a script line over an iPhone with the site's WhatsApp group, and what Site Bot files in the firstbriq CRM beside it |
| `src/components/bot-showcase/StageA.tsx`, `StageC.tsx`, `CrmWindow.tsx`, `BotCard.tsx`, `BooksFeed.tsx` | Alternative stages kept for comparison: A (phone and full CRM side by side, `?design=a`) and C (scroll story, `?design=c`) |
| `src/components/bot-showcase/Sections.tsx` | Below the hero: the pilot call to action, with Briq waving |
| `src/components/bot-showcase/Briq3D.tsx`, `Mascot.tsx` | Briq in 3D (Three.js via react-three-fiber): waves, blinks and turns towards the pointer. Loaded separately; the flat drawing shows while it loads or if the browser has no WebGL |
| `src/components/bot-showcase/Briq.tsx` | Briq, Site Bot's mascot: a brick in a site helmet, waving and holding a bill (one SVG, animated) |
| `src/assets/bills/` | Bill photos shown in the chat (only the pictures; the chat text is the script) |
| `src/components/bot-showcase/Controls.tsx` | Play / Step / Restart under the stage |
| `src/components/bot-showcase/AnimatedNumber.tsx` | Numbers that count up instead of jumping |
| `src/components/bot-showcase/PmApprove.tsx` | The PM's cursor clicking Approve in the CRM, before an advance is posted |
| `src/components/bot-showcase/status.ts` | The one set of status colours the page uses |
| `src/components/bot-showcase/BotMark.tsx` | Site Bot's one avatar (firstbriq orange), used in the chat and in the CRM |
| `src/components/bot-showcase/Backdrop.tsx` | The blurred periwinkle-and-terracotta mosaic behind the stage and the pilot section |
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
