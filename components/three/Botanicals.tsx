"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

/** A single stylized leaf, authored as a bezier path (Section 3: "extruded from SVG paths you author in code"). */
function buildLeafShape(): THREE.Shape {
  const shape = new THREE.Shape();
  shape.moveTo(0, -0.5);
  shape.bezierCurveTo(0.32, -0.3, 0.36, 0.25, 0, 0.55);
  shape.bezierCurveTo(-0.36, 0.25, -0.32, -0.3, 0, -0.5);
  return shape;
}

type Instance = {
  basePos: THREE.Vector3;
  speed: number;
  phase: number;
  rotSpeed: number;
  scale: number;
};

export function Botanicals({ count = 36, spread = 6 }: { count?: number; spread?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const geometry = useMemo(() => {
    const shape = buildLeafShape();
    return new THREE.ExtrudeGeometry(shape, { depth: 0.02, bevelEnabled: false, curveSegments: 8 });
  }, []);

  const instances = useMemo<Instance[]>(() => {
    const arr: Instance[] = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        basePos: new THREE.Vector3(
          (Math.random() - 0.5) * spread,
          (Math.random() - 0.5) * spread * 0.6,
          (Math.random() - 0.5) * spread - 1
        ),
        speed: 0.15 + Math.random() * 0.25,
        phase: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.4,
        scale: 0.35 + Math.random() * 0.5,
      });
    }
    return arr;
  }, [count, spread]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const mesh = meshRef.current;
    if (!mesh) return;
    instances.forEach((inst, i) => {
      const drift = Math.sin(t * inst.speed + inst.phase);
      dummy.position.set(
        inst.basePos.x + Math.sin(t * inst.speed * 0.5 + inst.phase) * 0.3,
        inst.basePos.y + drift * 0.25,
        inst.basePos.z
      );
      dummy.rotation.set(t * inst.rotSpeed, t * inst.rotSpeed * 0.6, Math.sin(t * 0.2 + inst.phase) * 0.3);
      dummy.scale.setScalar(inst.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[geometry, undefined, count]}>
      <meshStandardMaterial color="#3f4a3a" roughness={0.7} metalness={0} side={THREE.DoubleSide} />
    </instancedMesh>
  );
}
