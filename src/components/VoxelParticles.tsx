import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store';

interface Particle {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  rot: THREE.Euler;
  rotVel: THREE.Vector3;
  color: string;
  size: number;
  scale: number;
  life: number;
  maxLife: number;
}

const PALETTE = [
  '#38bdf8', // sky cyan
  '#34d399', // emerald
  '#fbbf24', // amber gold
  '#f43f5e', // rose red
  '#a855f7', // purple
  '#fb923c', // vibrant orange
  '#facc15', // yellow
];

export const VoxelParticles: React.FC = () => {
  const isGoalReached = useGameStore((state) => state.isGoalReached);
  const blocks = useGameStore((state) => state.blocks);
  const marblePos = useGameStore((state) => state.marblePosition);

  const goal = blocks.find((b) => b.type === 'goal');
  const origin = useMemo(() => {
    if (goal) {
      return new THREE.Vector3(goal.position[0], goal.position[1] + 0.4, goal.position[2]);
    }
    return new THREE.Vector3(marblePos.x, marblePos.y + 0.3, marblePos.z);
  }, [goal, marblePos.x, marblePos.y, marblePos.z]);

  // Generate 60 mini-cube particles
  const particles = useMemo<Particle[]>(() => {
    if (!isGoalReached) return [];

    const list: Particle[] = [];
    const count = 64;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radialSpeed = 1.5 + Math.random() * 3.5;
      const upSpeed = 3.5 + Math.random() * 5.0;

      list.push({
        pos: new THREE.Vector3(
          origin.x + (Math.random() - 0.5) * 0.3,
          origin.y + (Math.random() - 0.5) * 0.2,
          origin.z + (Math.random() - 0.5) * 0.3
        ),
        vel: new THREE.Vector3(
          Math.cos(angle) * radialSpeed,
          upSpeed,
          Math.sin(angle) * radialSpeed
        ),
        rot: new THREE.Euler(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        ),
        rotVel: new THREE.Vector3(
          (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 12
        ),
        color: PALETTE[i % PALETTE.length],
        size: 0.08 + Math.random() * 0.07,
        scale: 1,
        life: 0,
        maxLife: 2.2 + Math.random() * 0.8,
      });
    }
    return list;
  }, [isGoalReached, origin]);

  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!isGoalReached || particles.length === 0 || !groupRef.current) return;

    const gravity = -9.8;
    const clampedDelta = Math.min(delta, 0.1);

    groupRef.current.children.forEach((child, idx) => {
      const p = particles[idx];
      if (!p) return;

      p.life += clampedDelta;
      const progress = p.life / p.maxLife;

      if (progress < 1) {
        // Physics integration
        p.vel.y += gravity * clampedDelta;
        p.pos.x += p.vel.x * clampedDelta;
        p.pos.y += p.vel.y * clampedDelta;
        p.pos.z += p.vel.z * clampedDelta;

        // Bounce gently off the ground plane at y = -0.4
        if (p.pos.y < -0.38) {
          p.pos.y = -0.38;
          p.vel.y = -p.vel.y * 0.45;
          p.vel.x *= 0.8;
          p.vel.z *= 0.8;
        }

        // Tumble rotation
        p.rot.x += p.rotVel.x * clampedDelta;
        p.rot.y += p.rotVel.y * clampedDelta;
        p.rot.z += p.rotVel.z * clampedDelta;

        // Scale fade out near end of life
        p.scale = Math.max(0, 1 - Math.pow(progress, 3));

        // Update mesh transform
        child.position.copy(p.pos);
        child.rotation.copy(p.rot);
        child.scale.setScalar(p.scale);
        child.visible = p.scale > 0.01;
      } else {
        child.visible = false;
      }
    });
  });

  if (!isGoalReached || particles.length === 0) return null;

  return (
    <group ref={groupRef}>
      {particles.map((p, idx) => (
        <mesh key={idx} position={p.pos} rotation={p.rot}>
          <boxGeometry args={[p.size, p.size, p.size]} />
          <meshStandardMaterial
            color={p.color}
            emissive={p.color}
            emissiveIntensity={0.4}
            roughness={0.3}
            metalness={0.2}
          />
        </mesh>
      ))}
    </group>
  );
};
