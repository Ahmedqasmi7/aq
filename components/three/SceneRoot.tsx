"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom, DepthOfField, Vignette } from "@react-three/postprocessing";
import { useSceneStore } from "@/store/scene-store";
import { sampleCameraPath, actWindow } from "./cameraPath";
import { AmberShard } from "./AmberShard";
import { WetSlateGround } from "./WetSlateGround";
import { FlaconBottle } from "./FlaconBottle";
import { Botanicals } from "./Botanicals";
import { FogVolume } from "./FogVolume";
import { ParticleDust } from "./ParticleDust";
import { NoteMarkers } from "./NoteMarkers";

const COLD = new THREE.Color("#7f9ac9");
const WARM = new THREE.Color("#E6C588");

function CameraRig() {
  const { camera } = useThree();
  const currentPos = useRef(new THREE.Vector3(0, 0.15, 3.6));
  const currentTarget = useRef(new THREE.Vector3(0, 0.1, 0));

  useFrame((_, delta) => {
    const progress = useSceneStore.getState().progress;
    const sample = sampleCameraPath(progress);
    const damp = 1 - Math.pow(0.001, delta);

    currentPos.current.lerp(sample.position, damp);
    currentTarget.current.lerp(sample.target, damp);

    camera.position.copy(currentPos.current);
    camera.lookAt(currentTarget.current);
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = THREE.MathUtils.lerp(camera.fov, sample.fov, damp);
      camera.updateProjectionMatrix();
    }
  });

  return null;
}

function Lighting() {
  const keyLightRef = useRef<THREE.DirectionalLight>(null);

  useFrame(() => {
    const progress = useSceneStore.getState().progress;
    const monolithT = THREE.MathUtils.clamp((progress - 0.17) / (0.34 - 0.17), 0, 1);
    if (keyLightRef.current) {
      keyLightRef.current.color.copy(COLD).lerp(WARM, monolithT);
      keyLightRef.current.intensity = 0.7 + monolithT * 0.7;
    }
  });

  return (
    <>
      <ambientLight intensity={0.12} color="#0E1411" />
      <directionalLight ref={keyLightRef} position={[3, 4, 2]} intensity={0.7} />
      <pointLight position={[-2, 1, 2]} intensity={0.2} color="#C5A059" />
    </>
  );
}

function ActContents() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    const progress = useSceneStore.getState().progress;

    const shardW = actWindow(progress, -0.05, 0.0, 0.08, 0.19);
    const monolithW = actWindow(progress, 0.14, 0.19, 0.36, 0.42);
    const forestW = actWindow(progress, 0.34, 0.4, 0.58, 0.64);
    const alchemyW = actWindow(progress, 0.58, 0.63, 0.79, 0.85);
    const acquireW = actWindow(progress, 0.79, 0.85, 1.01, 1.02);

    const group = groupRef.current;
    if (!group) return;

    setLayerVisibility(group, "shard", shardW);
    setLayerVisibility(group, "monolith", monolithW);
    setLayerVisibility(group, "forest", forestW);
    setLayerVisibility(group, "alchemy", alchemyW);
    setLayerVisibility(group, "acquire", acquireW);
  });

  return (
    <group ref={groupRef}>
      <group name="shard">
        <AmberShard position={[0, 0.1, 0]} />
        <WetSlateGround y={-1.35} />
      </group>

      <group name="monolith">
        <FlaconBottle position={[0, 0.2, 0]} />
      </group>

      <group name="forest">
        <Botanicals count={30} spread={7} />
      </group>

      <group name="alchemy">
        <FlaconBottle position={[0, 0.2, 0]} />
        <NoteMarkers />
      </group>

      <group name="acquire">
        <FlaconBottle position={[-1.6, 0.1, 0]} />
        <FlaconBottle position={[0, 0.1, 0]} />
        <FlaconBottle position={[1.6, 0.1, 0]} />
      </group>
    </group>
  );
}

function setLayerVisibility(root: THREE.Group, name: string, weight: number) {
  const layer = root.getObjectByName(name);
  if (!layer) return;
  const visible = weight > 0.01;
  layer.visible = visible;
  const scale = 0.85 + weight * 0.15;
  layer.scale.setScalar(scale);
  layer.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
    if (!material) return;
    const mats = Array.isArray(material) ? material : [material];
    for (const m of mats) {
      const shaderMat = m as THREE.ShaderMaterial;
      if (shaderMat.isShaderMaterial && shaderMat.uniforms?.uOpacity) {
        shaderMat.uniforms.uOpacity.value = weight;
      } else if ("opacity" in m) {
        (m as THREE.Material & { opacity: number }).opacity = weight;
        m.transparent = true;
      }
    }
  });
}

export function SceneRoot() {
  return (
    <>
      <CameraRig />
      <Lighting />
      <FogVolume />
      <ParticleDust />
      <ActContents />
      <EffectComposer multisampling={0}>
        <DepthOfField focusDistance={0.02} focalLength={0.05} bokehScale={2} height={480} />
        <Bloom luminanceThreshold={0.72} luminanceSmoothing={0.25} intensity={0.35} mipmapBlur />
        <Vignette eskil={false} offset={0.25} darkness={0.95} />
      </EffectComposer>
    </>
  );
}
