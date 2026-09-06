"use client";

import { create } from "zustand";

/**
 * Drives the home page's cinematic scroll rig. `progress` is written on every
 * scroll tick by the Lenis/ScrollTrigger wiring in HomeExperience, and read
 * imperatively (via `useSceneStore.getState()`, never the hook) inside R3F
 * `useFrame` callbacks — that keeps 60fps camera/shader updates off React's
 * render cycle entirely. HTML overlays that need to re-render on scroll
 * should prefer GSAP ScrollTrigger callbacks on their own refs instead of
 * subscribing to this store.
 */
type SceneState = {
  progress: number;
  mouse: { x: number; y: number };
  activeNote: string | null;
  setProgress: (p: number) => void;
  setMouse: (x: number, y: number) => void;
  setActiveNote: (n: string | null) => void;
};

export const useSceneStore = create<SceneState>((set) => ({
  progress: 0,
  mouse: { x: 0, y: 0 },
  activeNote: null,
  setProgress: (p) => set({ progress: p }),
  setMouse: (x, y) => set({ mouse: { x, y } }),
  setActiveNote: (n) => set({ activeNote: n }),
}));
