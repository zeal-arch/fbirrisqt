import { MotionConfig } from 'motion/react';
import Hero from '../components/bot-showcase/Hero';
import Sections from '../components/bot-showcase/Sections';

/* Site Bot showcase. To add it to the firstbriq frontend, copy components/bot-showcase, data/botShowcase.ts and
   hooks/usePresenter.ts, then add <Route path="/site-bot" element={<BotShowcase />} /> in App.tsx. */

/* B is the page's design; A and C stay available for comparison with ?design=a or ?design=c. */
type Design = 'a' | 'b' | 'c';
const fromUrl = (): Design => {
  const d = new URLSearchParams(window.location.search).get('design');
  return d === 'a' || d === 'c' ? d : 'b';
};

export default function BotShowcase() {
  return (
    <MotionConfig reducedMotion="user">
      <main>
        <Hero design={fromUrl()} />
        <Sections />
      </main>
    </MotionConfig>
  );
}
