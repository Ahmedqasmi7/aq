"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { makeSoftCircleSprite } from "./textures";
import { useSceneStore } from "@/store/scene-store";

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform vec2 uMouse;
  attribute float aSeed;
  varying float vAlpha;

  void main() {
    vec3 pos = position;
    pos.x += sin(uTime * 0.2 + aSeed * 10.0) * 0.5;
    pos.y += cos(uTime * 0.15 + aSeed * 7.0) * 0.35;
    pos.z += sin(uTime * 0.1 + aSeed * 5.0) * 0.5;

    vec4 worldPos = modelMatrix * vec4(pos, 1.0);
    vec4 viewPos = viewMatrix * worldPos;
    vec4 clip = projectionMatrix * viewPos;

    vec2 ndc = clip.xy / max(clip.w, 0.0001);
    vec2 diff = ndc - uMouse;
    float d = length(diff);
    float push = smoothstep(0.4, 0.0, d);
    vec2 dir = d > 0.0001 ? normalize(diff) : vec2(0.0);
    clip.xy += dir * push * 0.18 * clip.w;

    vAlpha = 0.35 + push * 0.65;
    gl_Position = clip;
    float rawSize = (2.5 + aSeed * 3.5 + push * 5.0) * (300.0 / max(-viewPos.z, 1.5));
    gl_PointSize = clamp(rawSize, 1.0, 34.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uSprite;
  varying float vAlpha;
  void main() {
    vec4 tex = texture2D(uSprite, gl_PointCoord);
    gl_FragColor = vec4(tex.rgb, tex.a * vAlpha);
  }
`;

export function ParticleDust({ count = 700, spread = 8 }: { count?: number; spread?: number }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const sprite = useMemo(() => makeSoftCircleSprite(64), []);

  const [positions, seeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * spread;
      pos[i * 3 + 1] = (Math.random() - 0.5) * spread * 0.7;
      pos[i * 3 + 2] = (Math.random() - 0.5) * spread - 1;
      seed[i] = Math.random();
    }
    return [pos, seed];
  }, [count, spread]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uSprite: { value: sprite },
    }),
    [sprite]
  );

  useFrame((state) => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    const mouse = useSceneStore.getState().mouse;
    materialRef.current.uniforms.uMouse.value.set(mouse.x, mouse.y);
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
