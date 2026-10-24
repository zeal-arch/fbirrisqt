import NoiseTexture from './NoiseTexture';

/* The stage background: a warm cream base with the film-grain NoiseTexture on top, where soft
   firstbriq tints (orange, apricot, clay) drift through the grain. A white spotlight keeps the
   centre bright behind the phone. */

const spot = 'radial-gradient(closest-side, rgba(255,255,255,0.75), rgba(255,255,255,0.35) 50%, rgba(255,255,255,0) 100%)';

export default function Backdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true" style={{ background: 'linear-gradient(180deg,#faf4e9 0%,#f8efe6 60%,#f5e7dd 100%)' }}>
      <NoiseTexture />
      {/* spotlight behind the phone */}
      <div className="absolute left-1/2 top-[8%] h-[85%] w-[42%] -translate-x-[62%]" style={{ background: spot }} />
      {/* a soft inner edge, like light falling off at the frame's border */}
      <div className="absolute inset-0 rounded-[22px] shadow-[inset_0_0_60px_rgba(255,255,255,0.45)]" />
    </div>
  );
}
