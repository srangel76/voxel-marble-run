import React from 'react';
import { CuboidCollider, RapierRigidBody, RigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { useGameStore } from '../../store';

interface BlockProps {
  position: [number, number, number];
  rotation: number;
}

export const LoopBlock: React.FC<BlockProps> = ({ position, rotation }) => {
  const rotY = (rotation * Math.PI) / 2;
  const incrementLoops = useGameStore((state) => state.incrementLoops);

  // Smooth Loop trajectory assist
  const handleLoopEntryAssist = (e: any) => {
    const rb: RapierRigidBody = e.other?.rigidBody;
    if (!rb) return;

    const fwd = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotY);
    // Smooth upward transition into the loop arc
    rb.setLinvel({ x: fwd.x * 7.5, y: 5.5, z: fwd.z * 7.5 }, true);
  };

  const handleLoopApexAssist = (e: any) => {
    const rb: RapierRigidBody = e.other?.rigidBody;
    if (!rb) return;

    // Pull through apex and direct downward/forward along the loop
    const fwd = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotY);
    rb.setLinvel({ x: fwd.x * 5.0, y: -4.0, z: fwd.z * 5.0 }, true);
  };

  const handleLoopExit = (e: any) => {
    const rb: RapierRigidBody = e.other?.rigidBody;
    if (!rb) return;

    // Shoot forward along exit track towards the Splitter
    const fwd = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotY);
    rb.setLinvel({ x: fwd.x * 4.8, y: 0.1, z: fwd.z * 4.8 }, true);
    incrementLoops();
  };

  return (
    <RigidBody type="fixed" position={position} rotation={[0, rotY, 0]} colliders={false}>
      <group>
        {/* Base foundation platform */}
        <mesh position={[0, -0.25, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.98, 0.5, 0.98]} />
          <meshStandardMaterial color="#0f172a" roughness={0.7} />
        </mesh>

        {/* 1x3x3 Tower Arch Columns */}
        <mesh position={[-0.4, 0.95, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.16, 2.4, 0.96]} />
          <meshStandardMaterial color="#1e1b4b" roughness={0.5} />
        </mesh>
        <mesh position={[0.4, 0.95, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.16, 2.4, 0.96]} />
          <meshStandardMaterial color="#1e1b4b" roughness={0.5} />
        </mesh>
        <mesh position={[0, 2.15, 0]} castShadow>
          <boxGeometry args={[0.96, 0.18, 0.96]} />
          <meshStandardMaterial color="#312e81" roughness={0.4} />
        </mesh>

        {/* Track runners */}
        <mesh position={[0, 0.01, 0]} receiveShadow>
          <boxGeometry args={[0.46, 0.03, 0.98]} />
          <meshStandardMaterial color="#4338ca" />
        </mesh>

        {/* Visual 3D Looping Torus Ribbons */}
        <group position={[0, 1.0, 0]}>
          <mesh position={[-0.08, 0, 0]}>
            <torusGeometry args={[0.75, 0.08, 16, 32]} />
            <meshStandardMaterial
              color="#6366f1"
              emissive="#4f46e5"
              emissiveIntensity={0.6}
              roughness={0.2}
            />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <torusGeometry args={[0.76, 0.02, 16, 32]} />
            <meshBasicMaterial color="#a5b4fc" />
          </mesh>
        </group>
      </group>

      {/* Physics Colliders - Compound Smooth Chute */}
      {/* 1. Base floor collider for entrance/exit */}
      <CuboidCollider
        args={[0.24, 0.25, 0.502]}
        position={[0, -0.25, 0]}
        friction={0.02}
        restitution={0.1}
      />

      {/* 2. Left and Right Guard Walls */}
      <CuboidCollider
        args={[0.08, 0.9, 0.49]}
        position={[-0.32, 0.9, 0]}
        friction={0.02}
        restitution={0.1}
      />
      <CuboidCollider
        args={[0.08, 0.9, 0.49]}
        position={[0.32, 0.9, 0]}
        friction={0.02}
        restitution={0.1}
      />

      {/* 3. Ascending Ramp & Curve */}
      <CuboidCollider
        args={[0.22, 0.04, 0.35]}
        position={[0, 0.45, -0.05]}
        rotation={[-Math.PI / 4, 0, 0]}
        friction={0.02}
        restitution={0.1}
      />

      {/* 4. Apex Roof Deflector (y = 1.85) */}
      <CuboidCollider
        args={[0.22, 0.04, 0.35]}
        position={[0, 1.85, 0]}
        rotation={[Math.PI, 0, 0]}
        friction={0.02}
        restitution={0.1}
      />

      {/* 5. Descending Exit Ramp */}
      <CuboidCollider
        args={[0.22, 0.04, 0.35]}
        position={[0, 0.45, 0.15]}
        rotation={[Math.PI / 4, 0, 0]}
        friction={0.02}
        restitution={0.1}
      />

      {/* SENSORS */}
      {/* Entrance boost & upward transition */}
      <CuboidCollider
        sensor
        args={[0.24, 0.3, 0.2]}
        position={[0, 0.2, -0.25]}
        onIntersectionEnter={handleLoopEntryAssist}
      />

      {/* Apex pull through assist */}
      <CuboidCollider
        sensor
        args={[0.24, 0.3, 0.25]}
        position={[0, 1.5, 0]}
        onIntersectionEnter={handleLoopApexAssist}
      />

      {/* Exit forward propulsion & loop counter */}
      <CuboidCollider
        sensor
        args={[0.24, 0.3, 0.15]}
        position={[0, 0.15, 0.35]}
        onIntersectionEnter={handleLoopExit}
      />
    </RigidBody>
  );
};
