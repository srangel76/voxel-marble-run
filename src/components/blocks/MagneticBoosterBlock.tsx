import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { CuboidCollider, RigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { useGameStore } from '../../store';
import { sound } from '../../audio';

interface BlockProps {
  position: [number, number, number];
  rotation: number;
}

export const MagneticBoosterBlock: React.FC<BlockProps> = ({ position, rotation }) => {
  const rotY = (rotation * Math.PI) / 2;
  const incrementBoosts = useGameStore((state) => state.incrementBoosts);
  const ringRef = useRef<THREE.Group>(null);
  const lastBoostTime = useRef<number>(0);

  // Pulsing animation for neon accelerator coils
  useFrame(({ clock }) => {
    if (ringRef.current) {
      const s = 1 + Math.sin(clock.getElapsedTime() * 8) * 0.05;
      ringRef.current.scale.set(1, s, 1);
    }
  });

  const handleBoostIntersection = (e: any) => {
    const otherRb = e.other?.rigidBody;
    if (!otherRb) return;

    const now = Date.now();
    // Rate limit per marble to avoid re-boosting multiple times in same traversal
    if (now - lastBoostTime.current < 250) return;
    lastBoostTime.current = now;

    // Calculate forward directional vector based on block's Y rotation
    const fwd = new THREE.Vector3(0, 0, 1);
    fwd.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotY);

    // Set high forward boost velocity (10.0 m/s) to power through vertical loops & obstacles
    const boostVelocity = 10.0;
    otherRb.setLinvel(
      {
        x: fwd.x * boostVelocity,
        y: 0.15, // slight upward clearance
        z: fwd.z * boostVelocity,
      },
      true
    );

    // Synthetic audio effect & store telemetry
    sound.playBoostSound();
    incrementBoosts();
  };

  return (
    <RigidBody type="fixed" position={position} rotation={[0, rotY, 0]} colliders={false}>
      <group>
        {/* Base foundation */}
        <mesh position={[0, -0.25, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.98, 0.5, 0.98]} />
          <meshStandardMaterial color="#0f172a" roughness={0.6} />
        </mesh>

        {/* Magnetic Rail Bed (Glowing energy floor) */}
        <mesh position={[0, 0.01, 0]} receiveShadow>
          <boxGeometry args={[0.46, 0.03, 0.98]} />
          <meshStandardMaterial color="#0369a1" roughness={0.2} metalness={0.4} />
        </mesh>

        {/* Central Energy Stripe */}
        <mesh position={[0, 0.028, 0]}>
          <boxGeometry args={[0.08, 0.005, 0.96]} />
          <meshStandardMaterial color="#00f0ff" emissive="#0284c7" emissiveIntensity={0.8} />
        </mesh>

        {/* 3 Pulsing Neon Accelerator Rings */}
        <group ref={ringRef}>
          {[-0.32, 0, 0.32].map((zPos, idx) => (
            <group key={idx} position={[0, 0.28, zPos]}>
              {/* Left Pillar */}
              <mesh position={[-0.26, 0, 0]}>
                <boxGeometry args={[0.08, 0.5, 0.1]} />
                <meshStandardMaterial color="#0284c7" metalness={0.8} roughness={0.2} />
              </mesh>
              {/* Right Pillar */}
              <mesh position={[0.26, 0, 0]}>
                <boxGeometry args={[0.08, 0.5, 0.1]} />
                <meshStandardMaterial color="#0284c7" metalness={0.8} roughness={0.2} />
              </mesh>
              {/* Overhead Coil Arch */}
              <mesh position={[0, 0.24, 0]}>
                <boxGeometry args={[0.6, 0.08, 0.1]} />
                <meshStandardMaterial
                  color="#38bdf8"
                  emissive="#00f0ff"
                  emissiveIntensity={1.2}
                  roughness={0.1}
                />
              </mesh>
              {/* Inner glowing core accent */}
              <mesh position={[0, 0.2, 0]}>
                <boxGeometry args={[0.46, 0.03, 0.08]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
            </group>
          ))}
        </group>

        {/* Left Guard Wall */}
        <mesh position={[-0.36, 0.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.24, 0.44, 0.98]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} />
        </mesh>
        <mesh position={[-0.245, 0.35, 0]}>
          <boxGeometry args={[0.03, 0.14, 0.98]} />
          <meshStandardMaterial color="#00f0ff" emissive="#0284c7" emissiveIntensity={0.5} />
        </mesh>

        {/* Right Guard Wall */}
        <mesh position={[0.36, 0.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.24, 0.44, 0.98]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} />
        </mesh>
        <mesh position={[0.245, 0.35, 0]}>
          <boxGeometry args={[0.03, 0.14, 0.98]} />
          <meshStandardMaterial color="#00f0ff" emissive="#0284c7" emissiveIntensity={0.5} />
        </mesh>
      </group>

      {/* Solid Physics Colliders - Compound */}
      <CuboidCollider
        args={[0.24, 0.25, 0.502]}
        position={[0, -0.25, 0]}
        friction={0.1}
        restitution={0.2}
      />
      <CuboidCollider
        args={[0.13, 0.35, 0.502]}
        position={[-0.37, 0.15, 0]}
        friction={0.1}
        restitution={0.2}
      />
      <CuboidCollider
        args={[0.13, 0.35, 0.502]}
        position={[0.37, 0.15, 0]}
        friction={0.1}
        restitution={0.2}
      />

      {/* MAGNETIC ACCELERATOR SENSOR COLLIDER */}
      <CuboidCollider
        sensor
        args={[0.22, 0.3, 0.45]}
        position={[0, 0.2, 0]}
        onIntersectionEnter={handleBoostIntersection}
      />
    </RigidBody>
  );
};
