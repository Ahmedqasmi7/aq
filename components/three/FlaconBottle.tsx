"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { makeNoiseTexture } from "./textures";
import { useSceneStore } from "@/store/scene-store";

// ---------------------------------------------------------------------------
// Brushed-gold anisotropic cap shader: view-dependent streaks along a fixed
// "brush" direction, layered over a gold base + fresnel rim.
// ---------------------------------------------------------------------------
const goldVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec3 vTangent;
  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vNormal = normalize(mat3(modelMatrix) * normal);
    vViewDir = normalize(cameraPosition - worldPos.xyz);
    vTangent = normalize(mat3(modelMatrix) * vec3(0.0, 1.0, 0.0));
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const goldFragment = /* glsl */ `
  uniform float uTime;
  uniform float uOpacity;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec3 vTangent;

  void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(vViewDir);
    vec3 T = normalize(vTangent);

    float fresnel = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 3.0);

    // anisotropic brushed streaks: angle between view and tangent
    float align = dot(V, T);
    float streak = sin(align * 220.0 + N.x * 40.0) * 0.5 + 0.5;
    streak = pow(streak, 4.0);

    vec3 goldBase = vec3(0.62, 0.49, 0.28);
    vec3 goldHi = vec3(0.94, 0.82, 0.55);

    vec3 color = mix(goldBase, goldHi, streak * 0.6 + fresnel * 0.4);
    gl_FragColor = vec4(color, uOpacity);
  }
`;

// ---------------------------------------------------------------------------
// Liquid volume shader: continuous swirl, reacts to live mouse position.
// ---------------------------------------------------------------------------
const liquidVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vNormal = normalize(mat3(modelMatrix) * normal);
    vViewDir = normalize(cameraPosition - worldPos.xyz);
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const liquidFragment = /* glsl */ `
  uniform float uTime;
  uniform float uOpacity;
  uniform sampler2D uNoise;
  uniform vec2 uMouse;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec2 vUv;

  void main() {
    vec2 mouseInfluence = uMouse * 0.06;
    vec2 swirlUv = vUv * 3.0 + vec2(sin(uTime * 0.15), cos(uTime * 0.12)) * 0.3 + mouseInfluence;
    float n1 = texture2D(uNoise, swirlUv + uTime * 0.02).r;
    float n2 = texture2D(uNoise, swirlUv * 1.7 - uTime * 0.015).r;

    vec3 deep = vec3(0.09, 0.05, 0.02);
    vec3 amber = vec3(0.78, 0.55, 0.24);
    vec3 highlight = vec3(0.95, 0.78, 0.45);

    vec3 color = mix(deep, amber, n1);
    color = mix(color, highlight, smoothstep(0.6, 0.95, n2));

    float fresnel = pow(1.0 - clamp(dot(normalize(vNormal), normalize(vViewDir)), 0.0, 1.0), 2.0);
    color += highlight * fresnel * 0.35;

    gl_FragColor = vec4(color, 0.88 * uOpacity);
  }
`;

export function FlaconBottle({
  position = [0, 0, 0] as [number, number, number],
  liquidColorTint,
}: {
  position?: [number, number, number];
  liquidColorTint?: string;
}) {
  const noise = useMemo(() => makeNoiseTexture(128), []);
  const capMatRef = useRef<THREE.ShaderMaterial>(null);
  const liquidMatRef = useRef<THREE.ShaderMaterial>(null);
  const bottleGroup = useRef<THREE.Group>(null);
  const { viewport } = useThree();

  const liquidUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uOpacity: { value: 1 },
      uNoise: { value: noise },
      uMouse: { value: new THREE.Vector2(0, 0) },
    }),
    [noise]
  );
  const goldUniforms = useMemo(() => ({ uTime: { value: 0 }, uOpacity: { value: 1 } }), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (capMatRef.current) capMatRef.current.uniforms.uTime.value = t;
    if (liquidMatRef.current) {
      liquidMatRef.current.uniforms.uTime.value = t;
      const mouse = useSceneStore.getState().mouse;
      liquidMatRef.current.uniforms.uMouse.value.set(mouse.x, mouse.y);
    }
    if (bottleGroup.current) {
      const mouse = useSceneStore.getState().mouse;
      bottleGroup.current.rotation.y += (mouse.x * 0.3 - bottleGroup.current.rotation.y) * 0.02;
    }
  });

  void viewport;
  void liquidColorTint;

  return (
    <group ref={bottleGroup} position={position}>
      {/* obsidian glass exterior — matte PBR, primitives only */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.62, 0.68, 1.7, 24]} />
        <meshPhysicalMaterial
          color="#050505"
          roughness={0.25}
          metalness={0.05}
          transmission={0.55}
          thickness={0.6}
          ior={1.45}
          clearcoat={0.4}
        />
      </mesh>

      {/* liquid volume inside the glass */}
      <mesh position={[0, -0.02, 0]} scale={[0.86, 0.9, 0.86]}>
        <cylinderGeometry args={[0.62, 0.68, 1.7, 24]} />
        <shaderMaterial
          ref={liquidMatRef}
          vertexShader={liquidVertex}
          fragmentShader={liquidFragment}
          uniforms={liquidUniforms}
          transparent
          side={THREE.FrontSide}
        />
      </mesh>

      {/* neck */}
      <mesh position={[0, 1.02, 0]}>
        <cylinderGeometry args={[0.22, 0.28, 0.32, 20]} />
        <meshStandardMaterial color="#050505" roughness={0.3} metalness={0.1} />
      </mesh>

      {/* gold band */}
      <mesh position={[0, 1.12, 0]}>
        <cylinderGeometry args={[0.235, 0.235, 0.08, 20]} />
        <shaderMaterial vertexShader={goldVertex} fragmentShader={goldFragment} uniforms={goldUniforms} transparent />
      </mesh>

      {/* cap — anisotropic brushed gold */}
      <mesh position={[0, 1.36, 0]}>
        <sphereGeometry args={[0.34, 24, 24]} />
        <shaderMaterial
          ref={capMatRef}
          vertexShader={goldVertex}
          fragmentShader={goldFragment}
          uniforms={goldUniforms}
          transparent
        />
      </mesh>
    </group>
  );
}
