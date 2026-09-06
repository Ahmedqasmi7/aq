import * as THREE from "three";

export type CameraKeyframe = {
  p: number;
  pos: [number, number, number];
  target: [number, number, number];
  fov?: number;
};

/** One continuous camera path across the whole home scroll (Acts I-V). No hard cuts — every act flows from the last camera pose. */
export const CAMERA_PATH: CameraKeyframe[] = [
  { p: 0.0, pos: [0, 0.15, 3.6], target: [0, 0.1, 0], fov: 35 },
  { p: 0.13, pos: [0, 0.2, 1.1], target: [0, 0.25, 0], fov: 42 },
  { p: 0.17, pos: [0, 0.6, 5.2], target: [0, 0.4, 0], fov: 38 },
  { p: 0.34, pos: [3.4, 0.9, 2.4], target: [0, 0.35, 0], fov: 38 },
  { p: 0.38, pos: [1.6, 0.4, 4.6], target: [0, 0, -1.5], fov: 44 },
  { p: 0.55, pos: [-1.8, 0.2, 3.2], target: [0.4, 0, -2.2], fov: 40 },
  { p: 0.62, pos: [0, 0.5, 4.8], target: [0, 0.35, 0], fov: 36 },
  { p: 0.78, pos: [1.3, 0.85, 3.3], target: [0.3, 0.4, 0], fov: 34 },
  { p: 0.83, pos: [0, 0.25, 4.1], target: [0, 0.2, 0], fov: 32 },
  { p: 1.0, pos: [0, 0.25, 3.3], target: [0, 0.2, 0], fov: 30 },
];

function smoothstep(t: number) {
  return t * t * (3 - 2 * t);
}

const _pos = new THREE.Vector3();
const _target = new THREE.Vector3();

export function sampleCameraPath(progress: number): { position: THREE.Vector3; target: THREE.Vector3; fov: number } {
  const p = THREE.MathUtils.clamp(progress, 0, 1);
  let i = 0;
  while (i < CAMERA_PATH.length - 2 && p > CAMERA_PATH[i + 1].p) i++;
  const a = CAMERA_PATH[i];
  const b = CAMERA_PATH[i + 1];
  const span = b.p - a.p || 1;
  const t = smoothstep(THREE.MathUtils.clamp((p - a.p) / span, 0, 1));

  _pos.set(...a.pos).lerp(new THREE.Vector3(...b.pos), t);
  _target.set(...a.target).lerp(new THREE.Vector3(...b.target), t);
  const fov = THREE.MathUtils.lerp(a.fov ?? 35, b.fov ?? 35, t);

  return { position: _pos.clone(), target: _target.clone(), fov };
}

/** Smooth 0→1→0 window used to cross-fade a group in/out around a progress range — never a hard cut. */
export function actWindow(progress: number, start: number, peak0: number, peak1: number, end: number): number {
  if (progress <= start || progress >= end) return 0;
  if (progress < peak0) return smoothstep((progress - start) / (peak0 - start));
  if (progress > peak1) return smoothstep((end - progress) / (end - peak1));
  return 1;
}
