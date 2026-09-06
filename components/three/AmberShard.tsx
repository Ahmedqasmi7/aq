"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { makeNoiseTexture } from "./textures";

const vertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec2 vUv;
  varying vec3 vWorldPos;

  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    vNormal = normalize(mat3(modelMatrix) * normal);
    vViewDir = normalize(cameraPosition - worldPos.xyz);
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uOpacity;
  uniform sampler2D uNoise;
  uniform vec3 uColorDeep;
  uniform vec3 uColorHighlight;
  uniform vec3 uColorRim;

  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec2 vUv;
  varying vec3 vWorldPos;

  void main() {
    float fresnel = pow(1.0 - clamp(dot(normalize(vNormal), normalize(vViewDir)), 0.0, 1.0), 2.4);

    vec2 driftUv = vUv * 2.4 + vec2(uTime * 0.015, uTime * 0.02);
    float fracture = texture2D(uNoise, driftUv).r;
    float fracture2 = texture2D(uNoise, vUv * 5.0 - vec2(uTime * 0.01)).r;

    vec3 base = mix(uColorDeep, uColorHighlight, clamp(fracture * 0.4 + fracture2 * 0.12, 0.0, 0.55));
    vec3 color = mix(base, uColorRim, fresnel * 0.45);

    float internalGlow = smoothstep(0.55, 0.95, fracture) * 0.1;
    color += uColorHighlight * internalGlow;

    float alpha = (0.68 + fresnel * 0.22) * uOpacity;
    gl_FragColor = vec4(color, alpha);
  }
`;

const dewVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vNormal = normalize(mat3(modelMatrix) * normal);
    vViewDir = normalize(cameraPosition - worldPos.xyz);
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const dewFragment = /* glsl */ `
  uniform float uOpacity;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    float fresnel = pow(1.0 - clamp(dot(normalize(vNormal), normalize(vViewDir)), 0.0, 1.0), 1.5);
    vec3 color = mix(vec3(0.9, 0.82, 0.6), vec3(1.0), fresnel);
    gl_FragColor = vec4(color, 0.85 * uOpacity);
  }
`;

function buildShardGeometry() {
  const points: THREE.Vector2[] = [
    new THREE.Vector2(0.0, -1.3),
    new THREE.Vector2(0.22, -0.9),
    new THREE.Vector2(0.4, -0.2),
    new THREE.Vector2(0.34, 0.55),
    new THREE.Vector2(0.14, 1.0),
    new THREE.Vector2(0.0, 1.12),
  ];
  return new THREE.LatheGeometry(points, 7);
}

export function AmberShard({ position = [0, 0, 0] as [number, number, number] }) {
  const noise = useMemo(() => makeNoiseTexture(128), []);
  const geometry = useMemo(() => buildShardGeometry(), []);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const dewRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uOpacity: { value: 1 },
      uNoise: { value: noise },
      uColorDeep: { value: new THREE.Color("#3a2410") },
      uColorHighlight: { value: new THREE.Color("#E6C588") },
      uColorRim: { value: new THREE.Color("#F5F4F0") },
    }),
    [noise]
  );
  const dewUniforms = useMemo(() => ({ uOpacity: { value: 1 } }), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (materialRef.current) materialRef.current.uniforms.uTime.value = t;
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.12;
    }
    if (dewRef.current) {
      // Dewdrop travels down the shard face on a slow loop, easing as it goes.
      const cycle = (t * 0.09) % 1;
      const eased = cycle * cycle * (3 - 2 * cycle);
      dewRef.current.position.y = 1.0 - eased * 2.1;
      dewRef.current.position.x = 0.3 + Math.sin(t * 0.6) * 0.01;
      dewRef.current.scale.setScalar(0.05 + Math.sin(cycle * Math.PI) * 0.015);
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh geometry={geometry}>
        <shaderMaterial
          ref={materialRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh ref={dewRef} position={[0.3, 0.2, 0.32]}>
        <sphereGeometry args={[1, 16, 16]} />
        <shaderMaterial
          vertexShader={dewVertex}
          fragmentShader={dewFragment}
          uniforms={dewUniforms}
          transparent
        />
      </mesh>
    </group>
  );
}
