import * as THREE from "three";

/**
 * Runtime-generated textures — no binary assets are loaded from disk. Each
 * function draws to an offscreen canvas once; callers should memoize the
 * result (see useMemo call sites) rather than regenerating per frame.
 */

/** Tileable-ish value-noise texture used to drive fog density and the amber shard's fracture detail. */
export function makeNoiseTexture(sizePx = 256): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = sizePx;
  canvas.height = sizePx;
  const ctx = canvas.getContext("2d")!;
  const image = ctx.createImageData(sizePx, sizePx);

  // Simple value-noise built from stacked random octaves — cheap and fully offline.
  const octaves = 4;
  for (let y = 0; y < sizePx; y++) {
    for (let x = 0; x < sizePx; x++) {
      let value = 0;
      let amp = 1;
      let freq = 1;
      let total = 0;
      for (let o = 0; o < octaves; o++) {
        const nx = (x / sizePx) * freq;
        const ny = (y / sizePx) * freq;
        value += amp * pseudoNoise2D(nx * 8, ny * 8);
        total += amp;
        amp *= 0.5;
        freq *= 2;
      }
      const v = Math.floor(((value / total) * 0.5 + 0.5) * 255);
      const i = (y * sizePx + x) * 4;
      image.data[i] = v;
      image.data[i + 1] = v;
      image.data[i + 2] = v;
      image.data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

function pseudoNoise2D(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const a = hash(ix, iy);
  const b = hash(ix + 1, iy);
  const c = hash(ix, iy + 1);
  const d = hash(ix + 1, iy + 1);
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  return lerp(lerp(a, b, ux), lerp(c, d, ux), uy) * 2 - 1;
}

function hash(x: number, y: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return s - Math.floor(s);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/** Soft radial-gradient sprite used for every particle-dust point. */
export function makeSoftCircleSprite(sizePx = 64): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = sizePx;
  canvas.height = sizePx;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createRadialGradient(
    sizePx / 2,
    sizePx / 2,
    0,
    sizePx / 2,
    sizePx / 2,
    sizePx / 2
  );
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.4, "rgba(230,197,136,0.6)");
  grad.addColorStop(1, "rgba(230,197,136,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, sizePx, sizePx);
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}
