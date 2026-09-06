"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { makeNoiseTexture } from "./textures";

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform sampler2D uNoise;
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uSpeed;
  varying vec2 vUv;

  void main() {
    vec2 uv1 = vUv * 1.4 + vec2(uTime * uSpeed, uTime * uSpeed * 0.4);
    vec2 uv2 = vUv * 2.1 - vec2(uTime * uSpeed * 0.6, uTime * uSpeed * 0.3);
    float n = texture2D(uNoise, uv1).r * 0.6 + texture2D(uNoise, uv2).r * 0.4;

    float edge = smoothstep(0.0, 0.4, vUv.y) * smoothstep(1.0, 0.6, vUv.y);
    float alpha = n * n * uOpacity * edge;

    gl_FragColor = vec4(uColor, alpha);
  }
`;

function FogLayer({ z, opacity, speed, scale }: { z: number; opacity: number; speed: number; scale: number }) {
  const noise = useMemo(() => makeNoiseTexture(128), []);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uNoise: { value: noise },
      uColor: { value: new THREE.Color("#0E1411") },
      uOpacity: { value: opacity },
      uSpeed: { value: speed },
    }),
    [noise, opacity, speed]
  );

  useFrame((state) => {
    if (materialRef.current) materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <mesh position={[0, 0, z]} scale={scale}>
      <planeGeometry args={[1, 1, 1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

export function FogVolume() {
  return (
    <group>
      <FogLayer z={-4} opacity={0.16} speed={0.01} scale={16} />
      <FogLayer z={-2.5} opacity={0.1} speed={0.016} scale={12} />
      <FogLayer z={-6.5} opacity={0.14} speed={0.006} scale={20} />
    </group>
  );
}
