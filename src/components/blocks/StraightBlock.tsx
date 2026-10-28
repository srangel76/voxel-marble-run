import React from 'react';
import { CuboidCollider, RigidBody } from '@react-three/rapier';

interface BlockProps {
  position: [number, number, number];
  rotation: number;
}

export const StraightBlock: React.FC<BlockProps> = ({ position, rotation }) => {
  const rotY = (rotation * Math.PI) / 2;

  return (
    <RigidBody type="fixed" position={position} rotation={[0, rotY, 0]} colliders={false}>
      <group>
        {/* Track Base/Foundation */}
        <mesh position={[0, -0.25, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.98, 0.5, 0.98]} />
          <meshStandardMaterial color="#1e293b" roughness={0.7} />
        </mesh>

        {/* Channel Floor (Cyan runner track) */}
        <mesh position={[0, 0.01, 0]} receiveShadow>
          <boxGeometry args={[0.46, 0.04, 0.98]} />
          <meshStandardMaterial color="#0284c7" roughness={0.2} metalness={0.1} />
        </mesh>

        {/* Center line guide stripe */}
        <mesh position={[0, 0.032, 0]}>
          <boxGeometry args={[0.06, 0.005, 0.96]} />
          <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.3} />
        </mesh>

        {/* Left Guard Wall */}
        <mesh position={[-0.36, 0.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.24, 0.44, 0.98]} />
          <meshStandardMaterial color="#334155" roughness={0.4} />
        </mesh>
        {/* Left Wall Trim */}
        <mesh position={[-0.245, 0.35, 0]}>
          <boxGeometry args={[0.03, 0.14, 0.98]} />
          <meshStandardMaterial color="#38bdf8" />
        </mesh>

        {/* Right Guard Wall */}
        <mesh position={[0.36, 0.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.24, 0.44, 0.98]} />
          <meshStandardMaterial color="#334155" roughness={0.4} />
        </mesh>
        {/* Right Wall Trim */}
        <mesh position={[0.245, 0.35, 0]}>
          <boxGeometry args={[0.03, 0.14, 0.98]} />
          <meshStandardMaterial color="#38bdf8" />
        </mesh>
      </group>

      {/* Physics Colliders - Compound */}
      {/* Floor collider: Y surface at 0.0. Slightly extended along Z to prevent boundary edge-snagging */}
      <CuboidCollider 
        args={[0.24, 0.25, 0.502]} 
        position={[0, -0.25, 0]} 
        friction={0.1} 
        restitution={0.2} 
      />
      {/* Left Wall collider: half-extents [0.13, 0.35, 0.502], center [-0.37, 0.15, 0] */}
      <CuboidCollider 
        args={[0.13, 0.35, 0.502]} 
        position={[-0.37, 0.15, 0]} 
        friction={0.1} 
        restitution={0.2} 
      />
      {/* Right Wall collider: half-extents [0.13, 0.35, 0.502], center [0.37, 0.15, 0] */}
      <CuboidCollider 
        args={[0.13, 0.35, 0.502]} 
        position={[0.37, 0.15, 0]} 
        friction={0.1} 
        restitution={0.2} 
      />
    </RigidBody>
  );
};
