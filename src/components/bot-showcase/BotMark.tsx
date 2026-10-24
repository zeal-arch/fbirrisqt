import { Bot } from 'lucide-react';

/* Site Bot's one avatar: a firstbriq-orange tile with a bot glyph. Used wherever the bot speaks,
   in the WhatsApp chat and in the CRM, so it reads as the same bot in both places. */

export default function BotMark({ size = 20 }: { size?: number }) {
  return (
    <span
      className="inline-grid shrink-0 place-items-center rounded-[28%] bg-primary text-white"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <Bot style={{ width: size * 0.62, height: size * 0.62 }} strokeWidth={2.2} />
    </span>
  );
}
