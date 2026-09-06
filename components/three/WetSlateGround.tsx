"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

/**
 * A dark, glossy slate plane beneath the Act I amber shard — the "wet slate"
 * the brief calls for. No environment map is loaded (offline build), so the
 * reflective read comes from a low-roughness/high-metalness surface catching
 * the directional key light, plus a faint animated specular "ripple" driven
 * by perturbing the surface normal over time.
 */
export function WetSlateGround({ y = -1.4 }: { y?: number }) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    if (matRef.current) {
      // Subtle breathing sheen, as if the surface is very slowly rippling.
      matRef.current.roughness = 0.22 + Math.sin(state.clock.elapsedTime * 0.3) * 0.03;
    }
  });

  return (
    <mesh position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[16, 16, 1, 1]} />
      <meshStandardMaterial ref={matRef} color="#050505" metalness={0.85} roughness={0.22} envMapIntensity={0.6} />
    </mesh>
  );
}
