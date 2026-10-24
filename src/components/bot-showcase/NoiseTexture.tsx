import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from 'react';

import { GRAIN_TILE, tilePixels, type TileKey } from '../../lib/film-grain';
import type { TileRequest, TileResponse } from '../../lib/grain.worker';

/* Film-grain texture, adapted from D:\projects\my_website\src\components\ui\NoiseTexture.tsx for the
   showcase stage: light theme only, filling its parent (not the viewport), and the amoebae are
   light blue on the left and firstbriq orange on the right. The grain tile comes from lib/film-grain.ts, built in a
   worker; soft colour lobes drift underneath a static grain mask, so the colour flows through the
   grains like a grainy print. */

interface NoiseTextureProps {
  className?: string;
  /** Grain strength. 1 = calibrated to the reference prints; 0.5 = half as strong. */
  intensity?: number;
  /** Size of one grain in device pixels. */
  grainSize?: number;
}

interface Tile {
  url: string;
  edge: number;
}

/** The colour mask is a bigger tile than the grain: its soft clumps would show a 512 px repeat. */
const AMOEBA_MASK_TILE = 1024;

interface Lobe {
  dx: number;
  dy: number;
  size: number;
  aspect: number;
  tone: Tone;
  crawl: 'a' | 'b' | 'c';
  time: number;
  delay: number;
  breathe: number;
}

/** How fast the amoebae crawl: 1 = the original pace. */
const CRAWL_SPEED = 1.3;

type Tone = 'blue' | 'sky' | 'orange' | 'clay';

/* A continuous, ungrained wash of the same lobes under the grain, so the colour fades into the cream. */
const WASH_OPACITY = 0.42;
const WASH_SCALE = 1.9;
/* Strength of the grain-masked colour on top of the wash. */
const GRAIN_TONE_STRENGTH = 0.65;
/* The wash fades out through a neutral cream, so neither the blue nor the orange goes grey at its edge. */
const WASH_FADE_RGB = '246, 238, 230';

/* Light blue on the left; firstbriq's brand orange (#D23E12, lightened) and a soft clay on the right. */
const PALETTE: Record<Tone, string> = { blue: '120, 172, 222', sky: '156, 196, 236', orange: '226, 112, 72', clay: '214, 140, 106' };

const AMOEBAE: ReadonlyArray<{ x: number; y: number; lobes: readonly Lobe[] }> = [
  {
    x: 16,
    y: 40,
    lobes: [
      { dx: 0, dy: 0, size: 38, aspect: 0.8, tone: 'blue', crawl: 'a', time: 34, delay: 0, breathe: 11 },
      { dx: 6, dy: 8, size: 28, aspect: 1.3, tone: 'sky', crawl: 'b', time: 27, delay: -9, breathe: 9 },
      { dx: -6, dy: -6, size: 22, aspect: 0.7, tone: 'blue', crawl: 'c', time: 41, delay: -20, breathe: 13 },
    ],
  },
  {
    x: 84,
    y: 55,
    lobes: [
      { dx: 0, dy: 0, size: 36, aspect: 1.2, tone: 'orange', crawl: 'c', time: 38, delay: -15, breathe: 12 },
      { dx: -6, dy: -6, size: 27, aspect: 0.75, tone: 'clay', crawl: 'a', time: 29, delay: -6, breathe: 10 },
      { dx: 5, dy: 7, size: 21, aspect: 1.4, tone: 'orange', crawl: 'b', time: 44, delay: -27, breathe: 14 },
    ],
  },
];

/* ── One seamless grain tile as a PNG blob URL, built in a worker (main-thread fallback) ── */
let tileWorker: Worker | null = null;
let tileWorkerBroken = false;
let tileRequestId = 0;
let tileWorkerStop: number | undefined;
const tileWaiting = new Map<number, (blob: Blob | null) => void>();

function getTileWorker(): Worker | null {
  if (tileWorkerBroken || typeof Worker === 'undefined' || typeof OffscreenCanvas === 'undefined') return null;
  if (!tileWorker) {
    try {
      const worker = new Worker(new URL('../../lib/grain.worker.ts', import.meta.url), { type: 'module' });
      worker.onmessage = ({ data }: MessageEvent<TileResponse>) => {
        tileWaiting.get(data.id)?.(data.blob);
        tileWaiting.delete(data.id);
        if (tileWaiting.size === 0) {
          window.clearTimeout(tileWorkerStop);
          tileWorkerStop = window.setTimeout(() => {
            if (tileWaiting.size === 0) {
              worker.terminate();
              if (tileWorker === worker) tileWorker = null;
            }
          }, 5000);
        }
      };
      worker.onerror = () => {
        tileWorkerBroken = true;
        tileWorker = null;
        tileWaiting.forEach(resolve => resolve(null));
        tileWaiting.clear();
      };
      tileWorker = worker;
    } catch {
      tileWorkerBroken = true;
      return null;
    }
  }
  window.clearTimeout(tileWorkerStop);
  return tileWorker;
}

function renderTileInWorker(key: TileKey, edge: number, intensity: number): Promise<Blob | null> | null {
  const worker = getTileWorker();
  if (!worker) return null;
  const id = ++tileRequestId;
  return new Promise(resolve => {
    tileWaiting.set(id, resolve);
    const request: TileRequest = { id, key, edge, intensity };
    worker.postMessage(request);
  });
}

function renderTileOnMainThread(key: TileKey, edge: number, intensity: number): Promise<Blob | null> {
  const canvas = document.createElement('canvas');
  canvas.width = edge;
  canvas.height = edge;
  const ctx = canvas.getContext('2d');
  if (!ctx) return Promise.resolve(null);
  const image = ctx.createImageData(edge, edge);
  image.data.set(tilePixels(key, edge, intensity));
  ctx.putImageData(image, 0, 0);
  return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
}

async function renderTile(key: TileKey, edge: number, intensity: number): Promise<string | null> {
  const blob = (await renderTileInWorker(key, edge, intensity)) ?? (await renderTileOnMainThread(key, edge, intensity));
  return blob ? URL.createObjectURL(blob) : null;
}

function whenIdle(task: () => void, timeout: number): () => void {
  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(task, { timeout });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(task, Math.min(timeout, 200));
  return () => window.clearTimeout(id);
}

function subscribeDevicePixelRatio(onChange: () => void): () => void {
  let query: MediaQueryList | null = null;
  const arm = () => {
    query = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    query.addEventListener('change', handleChange, { once: true });
  };
  const handleChange = () => {
    onChange();
    arm();
  };
  arm();
  return () => query?.removeEventListener('change', handleChange);
}

/* Tile edge that lands on whole CSS pixels at fractional device ratios, so the grain stays crisp. */
function tileEdge(base: number, dpr: number, grainSize: number): number {
  const span = Math.round(base * 0.125) * 2;
  let best = base;
  let bestGap = Infinity;
  for (let edge = base - span; edge <= base + span; edge += 2) {
    const css = (edge * grainSize) / dpr;
    if (Math.abs(css - Math.round(css)) > 0.002) continue;
    const gap = Math.abs(edge - base);
    if (gap < bestGap) {
      best = edge;
      bestGap = gap;
    }
  }
  return best;
}

const getDevicePixelRatio = () => window.devicePixelRatio || 1;

function lobeStyle(lobe: Lobe, wash = false): CSSProperties {
  const rgb = PALETTE[lobe.tone];
  const scale = wash ? WASH_SCALE : 1;
  const width = lobe.size * scale;
  const height = lobe.size * lobe.aspect * scale;
  return {
    left: `calc(${lobe.dx * scale}vmax - ${width / 2}vmax)`,
    top: `calc(${lobe.dy * scale}vmax - ${height / 2}vmax)`,
    width: `${width}vmax`,
    height: `${height}vmax`,
    backgroundImage: wash
      ? `radial-gradient(closest-side, rgba(${rgb}, 1) 0%, rgba(${rgb}, 0.5) 38%, rgba(${WASH_FADE_RGB}, 0.24) 72%, rgba(${WASH_FADE_RGB}, 0) 100%)`
      : `radial-gradient(closest-side, rgba(${rgb}, 1) 0%, rgba(${rgb}, 0.55) 45%, rgba(${rgb}, 0) 100%)`,
    ['--crawl' as string]: `amoeba-crawl-${lobe.crawl}`,
    ['--crawl-time' as string]: `${(lobe.time / CRAWL_SPEED).toFixed(2)}s`,
    ['--crawl-delay' as string]: `${(lobe.delay / CRAWL_SPEED).toFixed(2)}s`,
    ['--breathe-time' as string]: `${lobe.breathe}s`,
  };
}

export default function NoiseTexture({ className = '', intensity = 1, grainSize = 1 }: NoiseTextureProps) {
  const [tiles, setTiles] = useState<Partial<Record<TileKey, Tile>>>({});
  const dpr = useSyncExternalStore(subscribeDevicePixelRatio, getDevicePixelRatio, () => 1);
  const grainEdge = tileEdge(GRAIN_TILE, dpr, grainSize);
  const maskEdge = tileEdge(AMOEBA_MASK_TILE, dpr, grainSize);
  const urlsRef = useRef<Partial<Record<TileKey, string>>>({});

  useEffect(() => {
    const urls = urlsRef.current;
    return () => {
      Object.values(urls).forEach(url => url && URL.revokeObjectURL(url));
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const cancels: Array<() => void> = [];
    const build = async (key: TileKey) => {
      if (cancelled) return;
      const edge = key === 'amoeba' ? maskEdge : grainEdge;
      const url = await renderTile(key, edge, intensity);
      if (!url) return;
      if (cancelled) {
        URL.revokeObjectURL(url);
        return;
      }
      const previous = urlsRef.current[key];
      urlsRef.current[key] = url;
      setTiles(prev => ({ ...prev, [key]: { url, edge } }));
      if (previous) window.setTimeout(() => URL.revokeObjectURL(previous), 2000);
    };
    const queue: TileKey[] = ['light', 'amoeba'];
    const runFrom = (i: number) => {
      if (cancelled || i >= queue.length) return;
      cancels.push(whenIdle(() => void build(queue[i]).then(() => runFrom(i + 1)), i === 0 ? 300 : 1000));
    };
    runFrom(0);
    return () => {
      cancelled = true;
      cancels.forEach(cancel => cancel());
    };
  }, [intensity, grainEdge, maskEdge, grainSize]);

  const cssSize = (tile: Tile) => `${(tile.edge * grainSize) / dpr}px`;
  const grainTile = tiles.light;
  const amoebaTile = tiles.amoeba;
  const amoebaMask: CSSProperties = amoebaTile
    ? {
        maskImage: `url(${amoebaTile.url})`,
        WebkitMaskImage: `url(${amoebaTile.url})`,
        maskSize: `${cssSize(amoebaTile)} ${cssSize(amoebaTile)}`,
        WebkitMaskSize: `${cssSize(amoebaTile)} ${cssSize(amoebaTile)}`,
        maskRepeat: 'repeat',
        WebkitMaskRepeat: 'repeat',
      }
    : {};

  const amoebae = (wash = false) =>
    AMOEBAE.map(amoeba => (
      <div key={`${amoeba.x}-${amoeba.y}`} className="absolute" style={{ left: `${amoeba.x}%`, top: `${amoeba.y}%` }}>
        {amoeba.lobes.map(lobe => (
          <div key={`${lobe.dx}-${lobe.dy}`} className="amoeba-lobe absolute" style={lobeStyle(lobe, wash)} />
        ))}
      </div>
    ));

  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 select-none overflow-hidden ${className}`}>
      {/* continuous wash under the grain */}
      <div className="absolute inset-0" style={{ opacity: WASH_OPACITY }}>
        <div className="amoeba-layer absolute inset-0 overflow-hidden">{amoebae(true)}</div>
      </div>
      {/* warm espresso specks on cream */}
      <div
        className="absolute inset-0"
        style={grainTile ? { backgroundImage: `url(${grainTile.url})`, backgroundSize: `${cssSize(grainTile)} ${cssSize(grainTile)}` } : {}}
      />
      {/* colour flowing through the fixed grains */}
      <div className="amoeba-layer absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 transition-opacity duration-[2500ms]" style={{ ...amoebaMask, opacity: amoebaTile ? GRAIN_TONE_STRENGTH : 0 }}>
          {amoebae()}
        </div>
      </div>
    </div>
  );
}
