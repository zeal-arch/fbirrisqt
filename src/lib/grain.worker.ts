/**
 * Web Worker: generates a grain tile and encodes it as a PNG, off the main thread.
 * (Generating a tile costs 20-130 ms of pure JS, several times that on a phone: on the main thread
 * that is a long task right when the page is becoming interactive.)
 */
import { tilePixels, type TileKey } from "./film-grain";

export interface TileRequest {
  id: number;
  key: TileKey;
  edge: number;
  intensity: number;
}

export interface TileResponse {
  id: number;
  blob: Blob | null;
}

const scope = self as unknown as {
  onmessage: ((event: MessageEvent<TileRequest>) => void) | null;
  postMessage(message: TileResponse): void;
};

scope.onmessage = async ({ data }) => {
  let blob: Blob | null = null;
  try {
    const canvas = new OffscreenCanvas(data.edge, data.edge);
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const image = ctx.createImageData(data.edge, data.edge);
      image.data.set(tilePixels(data.key, data.edge, data.intensity));
      ctx.putImageData(image, 0, 0);
      blob = await canvas.convertToBlob({ type: "image/png" });
    }
  } catch {
    blob = null;
  }
  scope.postMessage({ id: data.id, blob });
};
