import { MotionConfig } from 'motion/react';
import Hero from '../components/bot-showcase/Hero';

/* Site Bot showcase: a single hero. To add it to the firstbriq frontend, copy components/bot-showcase,
   data/botShowcase.ts and hooks/usePresenter.ts, then add <Route path="/site-bot" element={<BotShowcase />} /> in App.tsx. */
export default function BotShowcase() {
  return (
    <MotionConfig reducedMotion="user">
      <main>
        <Hero />
      </main>
    </MotionConfig>
  );
}
