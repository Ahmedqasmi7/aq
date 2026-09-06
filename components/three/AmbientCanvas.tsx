"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { CanvasBoundary } from "@/components/shell/CanvasBoundary";
import { ParticleDust } from "./ParticleDust";
import { FogVolume } from "./FogVolume";

/**
 * The "lighter, purposeful WebGL accent" every secondary page uses instead
 * of the full home cinematic rig (Section 7): drifting gold dust + slow fog,
 * both still driven every frame, at a low particle count so it stays cheap
 * behind fast, content-first layouts.
 */
export function AmbientCanvas({ particleCount = 260 }: { particleCount?: number }) {
  return (
    <div className="velario-ambient-canvas" aria-hidden>
      <CanvasBoundary label="VELARIO ambient field">
        <Canvas
          dpr={[1, 1.5]}
          gl={{
            antialias: true,
            powerPreference: "low-power",
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 0.82,
          }}
          camera={{ position: [0, 0, 5], fov: 40 }}
        >
          <color attach="background" args={["#050505"]} />
          <ambientLight intensity={0.3} />
          <Suspense fallback={null}>
            <FogVolume />
            <ParticleDust count={particleCount} spread={7} />
          </Suspense>
        </Canvas>
      </CanvasBoundary>
      <style jsx>{`
        .velario-ambient-canvas {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
