import { useState } from 'react';

/* The stage background, after summation.com's blurred-photo look but our own colours: a soft periwinkle sky
   with a warm blush at the top left and firstbriq terracotta at the bottom right. Painted once on a tiny canvas,
   then shown twice: blown up with hard pixel edges, and blurred on top of that, so a faint mosaic shows
   through the haze. */

const W = 28;
const H = 16;

function paint(): string {
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d');
  if (!g) return '';
  g.fillStyle = '#b9c5e6';
  g.fillRect(0, 0, W, H);
  const blob = (x: number, y: number, r: number, color: string) => {
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, color);
    gr.addColorStop(1, 'rgba(185,197,230,0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, W, H);
  };
  blob(15, 8, 11, 'rgba(214,220,242,0.85)'); // light centre, behind the product
  blob(3, 2, 9, 'rgba(243,199,180,0.95)'); // blush, top left
  blob(8, 5, 5, 'rgba(222,178,176,0.6)');
  blob(26, 2, 7, 'rgba(158,176,222,0.85)'); // deeper blue, top right
  blob(25, 15, 11, 'rgba(229,148,112,0.6)'); // terracotta, bottom right
  blob(3, 15, 7, 'rgba(196,186,222,0.7)'); // lavender, bottom left
  return c.toDataURL();
}

/* A fine, static film grain laid over the haze (an SVG noise tile, so nothing is computed at runtime). */
const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/><feComponentTransfer><feFuncR type='linear' slope='2.4' intercept='-0.7'/><feFuncG type='linear' slope='2.4' intercept='-0.7'/><feFuncB type='linear' slope='2.4' intercept='-0.7'/></feComponentTransfer></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

export default function Backdrop() {
  const [src] = useState(paint);
  const layer = { backgroundImage: `url(${src})`, backgroundSize: '100% 100%' };
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#c6cfe9]" aria-hidden="true">
      <div className="absolute inset-0 [image-rendering:pixelated]" style={layer} />
      <div className="absolute -inset-10 opacity-60 blur-[28px]" style={layer} />
      <div className="absolute inset-0 opacity-[0.4] mix-blend-overlay" style={{ backgroundImage: GRAIN, backgroundSize: '240px 240px' }} />
    </div>
  );
}
