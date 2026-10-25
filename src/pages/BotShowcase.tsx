import { MotionConfig } from 'motion/react';
import Hero from '../components/bot-showcase/Hero';

/* Site Bot showcase: a single hero. To add it to the firstbriq frontend, copy components/bot-showcase,
   data/botShowcase.ts and hooks/usePresenter.ts, then add <Route path="/site-bot" element={<BotShowcase />} /> in App.tsx. */

/* Three stage designs for review, picked by the address: ?design=b or ?design=c (A otherwise). */
type Design = 'a' | 'b' | 'c';
const fromUrl = (): Design => {
  const d = new URLSearchParams(window.location.search).get('design');
  return d === 'b' || d === 'c' ? d : 'a';
};

export default function BotShowcase() {
  return (
    <MotionConfig reducedMotion="user">
      <main>
        <Hero design={fromUrl()} />
      </main>
    </MotionConfig>
  );
}
