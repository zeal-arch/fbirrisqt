/**
 * Analog film-grain tile generator (pure functions: no DOM, runs in the browser, a worker or Node).
 *
 * Model, fitted to measured reference prints (flat areas of scanned / photographed film-grain art):
 *  - the grain is LUMINANCE noise: R, G and B move together (correlation 0.97-1.00), so there is
 *    no per-pixel colour jitter; the "colour" of the grain is the tint of the two inks
 *  - every pixel is modulated; values are near-Gaussian with a heavier tail (about twice as many
 *    strong specks as a pure Gaussian, excess kurtosis +1 to +3)
 *  - neighbouring pixels are slightly correlated (0.15-0.4): soft ~1 px grains, not hard pixels
 *  - on a light page the visible specks are dark; on a dark page they are light
 *
 *  - the texture is multi-scale: fine grain over a soft larger mottle (`body`)
 *
 * A tile pixel is a speck of `darkInk` (where the grain value is negative) or `lightInk`
 * (positive) whose alpha is proportional to the grain value. Because the values are centred on
 * zero and both inks are used, the tile does not tint the page: it only adds texture.
 */

type RGB = readonly [number, number, number];

interface GrainSpec {
  /** Ink of specks darker than the page. */
  darkInk: RGB;
  /** Ink of specks lighter than the page. */
  lightInk: RGB;
  /** Alpha (0-1) of a dark speck at 1 sigma of grain. */
  darkGain: number;
  /** Alpha (0-1) of a light speck at 1 sigma of grain. */
  lightGain: number;
  /** Neighbour mixing weight: 0 = hard single-pixel noise, 0.1-0.25 = soft analog grain. */
  softness: number;
  /** Heavy-tail amount: 0 = pure Gaussian, ~0.3 = about twice as many strong specks. */
  tail: number;
  /** Weight of the soft, larger-scale mottle under the fine grain (0 = none, ~0.3 = film-like). */
  body: number;
  /** Fraction of pixels that become dust flecks (sparse, clearly stronger specks). */
  dust: number;
  /** Which ink the dust flecks use. */
  dustInk: "dark" | "light";
  /** PRNG seed: the same seed always gives the same tile. */
  seed: number;
}

/** Tile edge in texels. 512 keeps the repeat period far larger than any grain feature. */
export const GRAIN_TILE = 512;

/**
 * Light theme, calibrated on cream #faf4e9. Two-sided: warm espresso specks below the page colour
 * and paper-white specks above it, so the page keeps its colour (mean shift < 0.2 levels).
 * Luminance SD ~4.3 levels: the cream reference print measures 2.75 after JPEG compression;
 * intensity 0.65 reproduces that exactly.
 */
const GRAIN_LIGHT: GrainSpec = {
  darkInk: [32, 24, 16],
  lightInk: [255, 254, 250],
  darkGain: 0.021,
  lightGain: 0.5, // the page is close to white: light specks need a high alpha to show at all
  softness: 0.12,
  tail: 0.35,
  body: 0.32,
  dust: 0.001,
  dustInk: "dark",
  seed: 0x5eed01,
};

/**
 * Dark theme, calibrated on charcoal #101010: cool silver specks, with black specks using the
 * little headroom below the page colour. Luminance SD ~5.5 levels (dark-teal reference: 6-7 on a
 * brighter base).
 */
const GRAIN_DARK: GrainSpec = {
  darkInk: [0, 0, 0],
  lightInk: [215, 222, 230],
  darkGain: 0.26,
  lightGain: 0.034,
  softness: 0.22,
  tail: 0.4,
  body: 0.25,
  dust: 0,
  dustInk: "light",
  seed: 0x5eed02,
};

/**
 * Light theme "amoeba" mask. NOT a visible texture: its alpha says how strongly each grain lets
 * the blue show through. The tile stays fixed on the page while soft blue blobs drift underneath
 * it, so the blue flows *through* a static set of grains instead of carrying grain along.
 * Only grains above `threshold` (in sigmas) get any alpha, so just some grains can turn blue, and
 * the strong `body` clumps them into the mottled haze of a soft, grainy photo.
 */
interface AmoebaMaskSpec extends Pick<GrainSpec, "softness" | "tail" | "body" | "seed"> {
  /** Grain value (sigmas) below which a grain never turns blue. */
  threshold: number;
  /** Alpha (0-1) per sigma above the threshold. */
  gain: number;
}

const GRAIN_AMOEBA_MASK: AmoebaMaskSpec = {
  softness: 0.2,
  tail: 0.5,
  body: 0.55,
  seed: 0x5eed03,
  threshold: -0.35,
  gain: 0.32,
};

/** Small, fast, seedable PRNG (mulberry32) returning unsigned 32-bit integers. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return (t ^ (t >>> 14)) >>> 0;
  };
}

// A uniform byte has mean 127.5 and SD 73.9; sums of 4 and 3 bytes are near-normal.
const INV_SD_4_BYTES = 1 / 147.8;
const INV_SD_3_BYTES = 1 / 128;

/**
 * Zero-mean, unit-variance grain field of size x size values. It wraps around at the edges, so the
 * tile repeats seamlessly.
 */
function grainField(size: number, spec: GrainSpec): Float32Array {
  const n = size * size;
  const next = mulberry32(spec.seed);
  const field = new Float32Array(n);
  const tail = spec.tail;

  // Gaussian scale mixture: a normal value times a log-normal scale. Most pixels stay faint,
  // a few become strong specks (the heavy tail of real grain). Each normal is the sum of the
  // bytes of one 32-bit random number (central limit theorem): two PRNG calls per pixel.
  for (let i = 0; i < n; i++) {
    const u = next();
    const w = next();
    const g = ((u & 255) + ((u >>> 8) & 255) + ((u >>> 16) & 255) + (u >>> 24) - 510) * INV_SD_4_BYTES;
    const s = ((w & 255) + ((w >>> 8) & 255) + ((w >>> 16) & 255) - 382.5) * INV_SD_3_BYTES;
    field[i] = g * Math.exp(tail * s);
  }

  // Sparse dust flecks, added before the blur so each becomes a small soft speck.
  if (spec.dust > 0) {
    const sign = spec.dustInk === "dark" ? -1 : 1;
    const count = Math.round(n * spec.dust);
    for (let j = 0; j < count; j++) {
      field[next() % n] += sign * 5 * (0.5 + next() / 4294967296);
    }
  }

  blurWrap(field, size, spec.softness);
  normalise(field);

  // Body: a second, larger-scale layer (noise at half resolution, blurred, then upsampled). Real
  // grain is not single-scale: this soft mottle is what makes a flat colour feel like paper.
  if (spec.body > 0) {
    const half = size >> 1;
    const coarse = new Float32Array(half * half);
    for (let i = 0; i < coarse.length; i++) {
      const u = next();
      coarse[i] = (u & 255) + ((u >>> 8) & 255) + ((u >>> 16) & 255) + (u >>> 24) - 510;
    }
    blurWrap(coarse, half, 1);
    blurWrap(coarse, half, 1);
    normalise(coarse);
    // Bilinear upsampling x2 with wrap-around. Column indices and weights are the same for
    // every row, so they are computed once.
    const col0 = new Int32Array(size);
    const col1 = new Int32Array(size);
    const colW = new Float32Array(size);
    for (let x = 0; x < size; x++) {
      const f = (x - 0.5) / 2;
      const i0 = Math.floor(f);
      col0[x] = (i0 + half) % half;
      col1[x] = (i0 + 1 + half) % half;
      colW[x] = f - i0;
    }
    const body = spec.body;
    for (let y = 0; y < size; y++) {
      const wy = colW[y];
      const r0 = col0[y] * half;
      const r1 = col1[y] * half;
      const row = y * size;
      for (let x = 0; x < size; x++) {
        const c0 = col0[x];
        const c1 = col1[x];
        const wx = colW[x];
        const top = coarse[r0 + c0] + (coarse[r0 + c1] - coarse[r0 + c0]) * wx;
        const bottom = coarse[r1 + c0] + (coarse[r1 + c1] - coarse[r1 + c0]) * wx;
        field[row + x] += body * (top + (bottom - top) * wy);
      }
    }
    normalise(field);
  }
  return field;
}

/** Separable [k, 1, k] blur with wrap-around (in place): soft grain that still tiles seamlessly. */
function blurWrap(field: Float32Array, size: number, k: number): void {
  if (k <= 0) return;
  const norm = 1 / (1 + 2 * k);
  const last = size - 1;
  const tmp = new Float32Array(field.length);
  for (let y = 0; y < size; y++) {
    const row = y * size;
    tmp[row] = (field[row] + k * (field[row + last] + field[row + 1])) * norm;
    for (let i = row + 1, end = row + last; i < end; i++) {
      tmp[i] = (field[i] + k * (field[i - 1] + field[i + 1])) * norm;
    }
    tmp[row + last] = (field[row + last] + k * (field[row + last - 1] + field[row])) * norm;
  }
  for (let y = 0; y < size; y++) {
    const row = y * size;
    const up = (y === 0 ? last : y - 1) * size - row;
    const down = (y === last ? 0 : y + 1) * size - row;
    for (let i = row, end = row + size; i < end; i++) {
      field[i] = (tmp[i] + k * (tmp[i + up] + tmp[i + down])) * norm;
    }
  }
}

/** Shift and scale to zero mean and unit variance (in place). */
function normalise(field: Float32Array): void {
  const n = field.length;
  let sum = 0;
  let sumSq = 0;
  for (let i = 0; i < n; i++) {
    sum += field[i];
    sumSq += field[i] * field[i];
  }
  const mean = sum / n;
  const inv = 1 / Math.sqrt(Math.max(sumSq / n - mean * mean, 1e-12));
  for (let i = 0; i < n; i++) field[i] = (field[i] - mean) * inv;
}
/**
 * RGBA pixels (non-premultiplied) of one seamless grain tile.
 * `intensity` scales both gains: 1 = calibrated default, 0.5 = half as strong.
 */
function grainPixels(size: number, spec: GrainSpec, intensity = 1): Uint8ClampedArray {
  const field = grainField(size, spec);
  const out = new Uint8ClampedArray(size * size * 4);
  const [dr, dg, db] = spec.darkInk;
  const [lr, lg, lb] = spec.lightInk;
  const darkAlpha = spec.darkGain * intensity * 255;
  const lightAlpha = spec.lightGain * intensity * 255;
  const MAX_ALPHA = 230; // never a fully opaque pixel, even for the strongest speck

  for (let i = 0, p = 0; i < field.length; i++, p += 4) {
    const v = field[i];
    if (v < 0) {
      out[p] = dr;
      out[p + 1] = dg;
      out[p + 2] = db;
      out[p + 3] = Math.min(MAX_ALPHA, Math.round(-v * darkAlpha));
    } else {
      out[p] = lr;
      out[p + 1] = lg;
      out[p + 2] = lb;
      out[p + 3] = Math.min(MAX_ALPHA, Math.round(v * lightAlpha));
    }
  }
  return out;
}

/**
 * RGBA pixels of the amoeba mask tile: white, with alpha = how much blue this grain shows.
 * Used as a CSS mask, so only the alpha channel matters.
 */
function grainMaskPixels(size: number, spec: AmoebaMaskSpec, intensity = 1): Uint8ClampedArray {
  const field = grainField(size, { ...GRAIN_LIGHT, ...spec, dust: 0 });
  const out = new Uint8ClampedArray(size * size * 4);
  const scale = spec.gain * intensity * 255;
  for (let i = 0, p = 0; i < field.length; i++, p += 4) {
    out[p] = out[p + 1] = out[p + 2] = 255;
    out[p + 3] = Math.min(255, Math.round(Math.max(0, field[i] - spec.threshold) * scale));
  }
  return out;
}

export type TileKey = "light" | "dark" | "amoeba";

/** RGBA pixels of any tile, by key: shared by the main-thread fallback and the worker. */
export function tilePixels(key: TileKey, size: number, intensity: number): Uint8ClampedArray {
  if (key === "amoeba") return grainMaskPixels(size, GRAIN_AMOEBA_MASK, intensity);
  return grainPixels(size, key === "light" ? GRAIN_LIGHT : GRAIN_DARK, intensity);
}
