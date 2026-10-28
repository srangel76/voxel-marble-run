import React from 'react';
import { CuboidCollider, RigidBody } from '@react-three/rapier';

interface BlockProps {
  position: [number, number, number];
  rotation: number;
}

export const LauncherBlock: React.FC<BlockProps> = ({ position, rotation }) => {
  const rotY = (rotation * Math.PI) / 2;

  return (
    <RigidBody type="fixed" position={position} rotation={[0, rotY, 0]} colliders={false}>
      <group>
        {/* Base foundation */}
        <mesh position={[0, -0.25, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.98, 0.5, 0.98]} />
          <meshStandardMaterial color="#1e293b" roughness={0.7} />
        </mesh>

        {/* Launch Pad Floor runner (Emerald launch bay) */}
        <mesh position={[0, 0.01, 0]} receiveShadow>
          <boxGeometry args={[0.46, 0.03, 0.98]} />
          <meshStandardMaterial color="#059669" roughness={0.2} metalness={0.2} />
        </mesh>

        {/* Launch Arrow Decals on floor */}
        <mesh position={[0, 0.027, 0.1]}>
          <boxGeometry args={[0.18, 0.005, 0.18]} />
          <meshStandardMaterial color="#34d399" emissive="#10b981" emissiveIntensity={0.8} />
        </mesh>
        <mesh position={[0, 0.027, -0.1]}>
          <boxGeometry args={[0.12, 0.005, 0.12]} />
          <meshStandardMaterial color="#34d399" emissive="#10b981" emissiveIntensity={0.5} />
        </mesh>

        {/* Back Stop Wall */}
        <mesh position={[0, 0.25, -0.37]} castShadow receiveShadow>
          <boxGeometry args={[0.96, 0.5, 0.24]} />
          <meshStandardMaterial color="#047857" roughness={0.3} metalness={0.2} />
        </mesh>

        {/* Overhead Launch Arch */}
        <mesh position={[-0.36, 0.5, -0.2]} castShadow>
          <boxGeometry args={[0.2, 0.4, 0.2]} />
          <meshStandardMaterial color="#065f46" />
        </mesh>
        <mesh position={[0.36, 0.5, -0.2]} castShadow>
          <boxGeometry args={[0.2, 0.4, 0.2]} />
          <meshStandardMaterial color="#065f46" />
        </mesh>
        <mesh position={[0, 0.65, -0.2]} castShadow>
          <boxGeometry args={[0.92, 0.14, 0.22]} />
          <meshStandardMaterial color="#10b981" emissive="#059669" emissiveIntensity={0.5} />
        </mesh>

        {/* Left Guard Wall */}
        <mesh position={[-0.36, 0.2, 0.12]} castShadow receiveShadow>
          <boxGeometry args={[0.24, 0.44, 0.74]} />
          <meshStandardMaterial color="#334155" roughness={0.4} />
        </mesh>
        <mesh position={[-0.245, 0.35, 0.12]}>
          <boxGeometry args={[0.03, 0.14, 0.74]} />
          <meshStandardMaterial color="#34d399" />
        </mesh>

        {/* Right Guard Wall */}
        <mesh position={[0.36, 0.2, 0.12]} castShadow receiveShadow>
          <boxGeometry args={[0.24, 0.44, 0.74]} />
          <meshStandardMaterial color="#334155" roughness={0.4} />
        </mesh>
        <mesh position={[0.245, 0.35, 0.12]}>
          <boxGeometry args={[0.03, 0.14, 0.74]} />
          <meshStandardMaterial color="#34d399" />
        </mesh>
      </group>

      {/* Physics Colliders - Compound */}
      {/* 1. Floor collider: extended slightly for smooth exit transition */}
      <CuboidCollider 
        args={[0.24, 0.25, 0.502]} 
        position={[0, -0.25, 0]} 
        friction={0.1} 
        restitution={0.2} 
      />

      {/* 2. Back wall */}
      <CuboidCollider 
        args={[0.48, 0.35, 0.12]} 
        position={[0, 0.2, -0.37]} 
        friction={0.1} 
        restitution={0.2} 
      />

      {/* 3. Left Wall */}
      <CuboidCollider 
        args={[0.13, 0.35, 0.37]} 
        position={[-0.37, 0.15, 0.12]} 
        friction={0.1} 
        restitution={0.2} 
      />

      {/* 4. Right Wall */}
      <CuboidCollider 
        args={[0.13, 0.35, 0.37]} 
        position={[0.37, 0.15, 0.12]} 
        friction={0.1} 
        restitution={0.2} 
      />
    </RigidBody>
  );
};
