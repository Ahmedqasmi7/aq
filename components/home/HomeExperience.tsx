"use client";

import { Suspense, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CanvasBoundary } from "@/components/shell/CanvasBoundary";
import { SceneRoot } from "@/components/three/SceneRoot";
import { useSceneStore } from "@/store/scene-store";
import { ActI } from "./ActI";
import { ActII } from "./ActII";
import { ActIII } from "./ActIII";
import { ActIV } from "./ActIV";
import { ActV } from "./ActV";

export function HomeExperience() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => useSceneStore.getState().setProgress(self.progress),
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="home-scroll">
      <div className="home-canvas-fixed">
        <CanvasBoundary label="VELARIO cinematic experience">
          <Canvas
            dpr={[1, 1.75]}
            gl={{
              antialias: true,
              powerPreference: "high-performance",
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 0.82,
            }}
            camera={{ position: [0, 0.15, 3.6], fov: 35, near: 0.1, far: 40 }}
          >
            <color attach="background" args={["#050505"]} />
            <Suspense fallback={null}>
              <SceneRoot />
            </Suspense>
          </Canvas>
        </CanvasBoundary>
      </div>

      <ActI />
      <ActII />
      <ActIII />
      <ActIV />
      <ActV />
    </div>
  );
}
