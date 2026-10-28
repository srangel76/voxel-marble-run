import React from 'react';
import { CuboidCollider, RigidBody } from '@react-three/rapier';
import confetti from 'canvas-confetti';
import { useGameStore } from '../../store';

interface BlockProps {
  position: [number, number, number];
  rotation: number;
}

export const GoalBlock: React.FC<BlockProps> = ({ position, rotation }) => {
  const rotY = (rotation * Math.PI) / 2;
  const setGoalReached = useGameStore((state) => state.setGoalReached);

  const handleGoalTrigger = () => {
    setGoalReached();
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#34d399', '#fbbf24', '#f43f5e', '#a855f7'],
      });
    } catch {
      // fallback if canvas-confetti environment differs
    }
  };

  return (
    <RigidBody type="fixed" position={position} rotation={[0, rotY, 0]} colliders={false}>
      <group>
        {/* Base foundation */}
        <mesh position={[0, -0.25, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.98, 0.5, 0.98]} />
          <meshStandardMaterial color="#1e293b" roughness={0.7} />
        </mesh>

        {/* Goal Basin Floor (Gold/Amber winner finish pad) */}
        <mesh position={[0, 0.01, 0]} receiveShadow>
          <boxGeometry args={[0.46, 0.03, 0.98]} />
          <meshStandardMaterial color="#b45309" roughness={0.3} metalness={0.4} />
        </mesh>

        {/* Checkered Goal Ring Pad */}
        <mesh position={[0, 0.027, 0]}>
          <boxGeometry args={[0.36, 0.005, 0.36]} />
          <meshStandardMaterial color="#fbbf24" emissive="#d97706" emissiveIntensity={0.6} />
        </mesh>
        <mesh position={[0, 0.032, 0]}>
          <boxGeometry args={[0.2, 0.005, 0.2]} />
          <meshStandardMaterial color="#fef08a" emissive="#fbbf24" emissiveIntensity={0.9} />
        </mesh>

        {/* Back Stop Wall (keeps marble in the goal) */}
        <mesh position={[0, 0.25, 0.37]} castShadow receiveShadow>
          <boxGeometry args={[0.96, 0.5, 0.24]} />
          <meshStandardMaterial color="#92400e" roughness={0.3} metalness={0.2} />
        </mesh>

        {/* Left Guard Wall */}
        <mesh position={[-0.36, 0.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.24, 0.44, 0.98]} />
          <meshStandardMaterial color="#334155" roughness={0.4} />
        </mesh>
        <mesh position={[-0.245, 0.35, 0]}>
          <boxGeometry args={[0.03, 0.14, 0.98]} />
          <meshStandardMaterial color="#fbbf24" />
        </mesh>

        {/* Right Guard Wall */}
        <mesh position={[0.36, 0.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.24, 0.44, 0.98]} />
          <meshStandardMaterial color="#334155" roughness={0.4} />
        </mesh>
        <mesh position={[0.245, 0.35, 0]}>
          <boxGeometry args={[0.03, 0.14, 0.98]} />
          <meshStandardMaterial color="#fbbf24" />
        </mesh>

        {/* Victory Flagpole */}
        <mesh position={[0.34, 0.65, 0.34]} castShadow>
          <boxGeometry args={[0.04, 0.8, 0.04]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Victory Flag Pennant */}
        <mesh position={[0.22, 0.9, 0.34]} castShadow>
          <boxGeometry args={[0.2, 0.16, 0.02]} />
          <meshStandardMaterial color="#f59e0b" emissive="#d97706" emissiveIntensity={0.4} />
        </mesh>
      </group>

      {/* Physics Colliders - Compound */}
      {/* 1. Floor collider: extended slightly for smooth entrance transition */}
      <CuboidCollider 
        args={[0.24, 0.25, 0.502]} 
        position={[0, -0.25, 0]} 
        friction={0.1} 
        restitution={0.2} 
      />

      {/* 2. Back stop wall */}
      <CuboidCollider 
        args={[0.48, 0.35, 0.12]} 
        position={[0, 0.2, 0.37]} 
        friction={0.1} 
        restitution={0.2} 
      />

      {/* 3. Left Wall */}
      <CuboidCollider 
        args={[0.13, 0.35, 0.5]} 
        position={[-0.37, 0.15, 0]} 
        friction={0.1} 
        restitution={0.2} 
      />

      {/* 4. Right Wall */}
      <CuboidCollider 
        args={[0.13, 0.35, 0.5]} 
        position={[0.37, 0.15, 0]} 
        friction={0.1} 
        restitution={0.2} 
      />

      {/* 5. VICTORY SENSOR COLLIDER */}
      <CuboidCollider 
        sensor
        args={[0.2, 0.25, 0.25]} 
        position={[0, 0.15, 0]} 
        onIntersectionEnter={handleGoalTrigger}
      />
    </RigidBody>
  );
};
