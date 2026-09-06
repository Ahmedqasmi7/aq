"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { useSceneStore } from "@/store/scene-store";
import { actWindow } from "./cameraPath";

type Note = { name: string; tier: "top" | "heart" | "base"; pos: [number, number, number] };

const NOTES: Note[] = [
  { name: "Bergamot", tier: "top", pos: [0.9, 1.15, 0.3] },
  { name: "Fig", tier: "top", pos: [-0.95, 1.05, -0.2] },
  { name: "Midnight Orchid", tier: "heart", pos: [1.05, 0.3, 0.4] },
  { name: "Rose", tier: "heart", pos: [-1.05, 0.35, -0.35] },
  { name: "Smoked Amber", tier: "base", pos: [0.85, -0.7, 0.3] },
  { name: "Vetiver", tier: "base", pos: [-0.85, -0.75, -0.25] },
];

const TIER_LABEL: Record<Note["tier"], string> = {
  top: "Top Note",
  heart: "Heart Note",
  base: "Base Note",
};

// Same window as the "alchemy" act in SceneRoot — kept in sync deliberately
// rather than plumbed through React props, since this needs a per-frame
// (not per-render) opacity update on both the mesh and the DOM label.
const ALCHEMY_WINDOW: [number, number, number, number] = [0.58, 0.63, 0.79, 0.85];

function NoteMarker({ note }: { note: Note }) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<THREE.Group>(null);
  const active = useSceneStore((s) => s.activeNote === note.name);
  const setActiveNote = useSceneStore((s) => s.setActiveNote);

  useFrame(() => {
    const progress = useSceneStore.getState().progress;
    const weight = actWindow(progress, ...ALCHEMY_WINDOW);
    if (matRef.current) matRef.current.opacity = weight;
    if (cardRef.current) cardRef.current.style.opacity = String(weight);
    if (groupRef.current) groupRef.current.visible = weight > 0.02;
  });

  return (
    <group ref={groupRef} position={note.pos}>
      <mesh
        onPointerOver={(e) => {
          e.stopPropagation();
          setActiveNote(note.name);
        }}
        onPointerOut={() => setActiveNote(null)}
        scale={active ? 1.6 : 1}
      >
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial
          ref={matRef}
          color="#E6C588"
          emissive="#C5A059"
          emissiveIntensity={active ? 1.4 : 0.5}
          transparent
        />
      </mesh>
      <Html center distanceFactor={6} style={{ pointerEvents: "none" }}>
        <div ref={cardRef} className={`velario-note-card ${active ? "is-active" : ""}`} style={{ opacity: 0 }}>
          <span className="eyebrow">{TIER_LABEL[note.tier]}</span>
          <p>{note.name}</p>
        </div>
      </Html>
    </group>
  );
}

export function NoteMarkers() {
  return (
    <group>
      {NOTES.map((note) => (
        <NoteMarker key={note.name} note={note} />
      ))}
      <style jsx global>{`
        .velario-note-card {
          background: rgba(5, 5, 5, 0.75);
          border: 1px solid var(--color-line);
          padding: 6px 10px;
          white-space: nowrap;
          transform: translateY(-14px);
          backdrop-filter: blur(4px);
        }
        .velario-note-card p {
          font-family: var(--font-display), serif;
          font-size: 0.85rem;
          color: var(--color-parchment);
          margin-top: 2px;
        }
        .velario-note-card.is-active {
          border-color: var(--color-gold);
        }
        .velario-note-card.is-active p {
          color: var(--color-gold);
        }
      `}</style>
    </group>
  );
}
