import NoiseTexture from './NoiseTexture';

/* The stage background: a warm cream base with the film-grain NoiseTexture on top, where soft
   firstbriq tints (orange, apricot, clay) drift through the grain. The grain is masked so it stays full at the
   frame's edges and fades almost away behind the product, which keeps the phone and cards crisp. A white
   spotlight keeps that area bright. */

const spot = 'radial-gradient(closest-side, rgba(255,255,255,0.75), rgba(255,255,255,0.35) 50%, rgba(255,255,255,0) 100%)';

/* Grain mask with its calm centre at (x, y): about 12% grain there, full grain towards the edges. */
export const calmAt = (x: string, y: string) =>
  `radial-gradient(ellipse 62% 72% at ${x} ${y}, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.3) 45%, #000 100%)`;

interface Props {
  /* where the grain calms down (a CSS mask image) */
  grainMask?: string;
  /* the spotlight's centre, from the left; null for none */
  spotLeft?: string | null;
}

export default function Backdrop({ grainMask = calmAt('32%', '50%'), spotLeft = '45%' }: Props) {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true" style={{ background: 'linear-gradient(180deg,#faf4e9 0%,#f8efe6 60%,#f5e7dd 100%)' }}>
      <div className="absolute inset-0" style={{ maskImage: grainMask, WebkitMaskImage: grainMask }}>
        <NoiseTexture />
      </div>
      {/* spotlight behind the product */}
      {spotLeft && <div className="absolute top-[8%] h-[85%] w-[42%] -translate-x-1/2" style={{ left: spotLeft, background: spot }} />}
      {/* a soft inner edge, like light falling off at the frame's border */}
      <div className="absolute inset-0 rounded-[22px] shadow-[inset_0_0_60px_rgba(255,255,255,0.45)]" />
    </div>
  );
}
