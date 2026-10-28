import React from 'react';
import { CuboidCollider, RigidBody } from '@react-three/rapier';

interface BlockProps {
  position: [number, number, number];
  rotation: number;
}

export const RampBlock: React.FC<BlockProps> = ({ position, rotation }) => {
  const rotY = (rotation * Math.PI) / 2;
  const slopeAngle = Math.PI / 4; // 45 degrees slope

  return (
    <RigidBody type="fixed" position={position} rotation={[0, rotY, 0]} colliders={false}>
      <group>
        {/* Solid Voxel Foundation under the ramp */}
        {/* Lower wedge foundation */}
        <mesh position={[0, -0.25, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.98, 0.5, 0.98]} />
          <meshStandardMaterial color="#1e293b" roughness={0.7} />
        </mesh>
        {/* Upper tier foundation step */}
        <mesh position={[0, 0.25, -0.25]} castShadow receiveShadow>
          <boxGeometry args={[0.98, 0.5, 0.48]} />
          <meshStandardMaterial color="#1e293b" roughness={0.7} />
        </mesh>

        {/* Sloped Track Bed */}
        <group position={[0, 0.5, 0]} rotation={[slopeAngle, 0, 0]}>
          {/* Main Sloped Runner Track (Orange/Amber speed ramp) */}
          <mesh position={[0, -0.02, 0]} receiveShadow>
            <boxGeometry args={[0.46, 0.04, 1.42]} />
            <meshStandardMaterial color="#ea580c" roughness={0.2} metalness={0.1} />
          </mesh>

          {/* Glowing Speed Chevrons */}
          {[-0.35, 0, 0.35].map((z, idx) => (
            <mesh key={idx} position={[0, 0.005, z]}>
              <boxGeometry args={[0.2, 0.005, 0.08]} />
              <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.6} />
            </mesh>
          ))}

          {/* Left Guard Wall along slope */}
          <mesh position={[-0.36, 0.2, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.24, 0.42, 1.42]} />
            <meshStandardMaterial color="#334155" roughness={0.4} />
          </mesh>
          <mesh position={[-0.245, 0.35, 0]}>
            <boxGeometry args={[0.03, 0.14, 1.42]} />
            <meshStandardMaterial color="#fbbf24" />
          </mesh>

          {/* Right Guard Wall along slope */}
          <mesh position={[0.36, 0.2, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.24, 0.42, 1.42]} />
            <meshStandardMaterial color="#334155" roughness={0.4} />
          </mesh>
          <mesh position={[0.245, 0.35, 0]}>
            <boxGeometry args={[0.03, 0.14, 1.42]} />
            <meshStandardMaterial color="#fbbf24" />
          </mesh>
        </group>
      </group>

      {/* Physics Colliders - Compound */}
      {/* 1. Main Sloped Floor Collider: half-length = 0.70, width = 0.24, thickness = 0.05 */}
      <CuboidCollider 
        args={[0.24, 0.05, 0.70]} 
        position={[0, 0.465, 0]} 
        rotation={[slopeAngle, 0, 0]}
        friction={0.1} 
        restitution={0.2} 
      />

      {/* 2. Top transition pad: connects seamlessly at z = -0.5, y = 1.0 */}
      <CuboidCollider 
        args={[0.24, 0.25, 0.1]} 
        position={[0, 0.75, -0.45]} 
        friction={0.1} 
        restitution={0.2} 
      />

      {/* 3. Bottom transition pad: connects seamlessly to horizontal track at z = 0.5, y = 0.0 */}
      <CuboidCollider 
        args={[0.24, 0.25, 0.1]} 
        position={[0, -0.25, 0.45]} 
        friction={0.1} 
        restitution={0.2} 
      />

      {/* 4. Left sloped guard wall: prevents ball from falling off to the left */}
      <CuboidCollider 
        args={[0.13, 0.35, 0.72]} 
        position={[-0.37, 0.65, 0]} 
        rotation={[slopeAngle, 0, 0]}
        friction={0.1} 
        restitution={0.2} 
      />

      {/* 5. Right sloped guard wall: prevents ball from falling off to the right */}
      <CuboidCollider 
        args={[0.13, 0.35, 0.72]} 
        position={[0.37, 0.65, 0]} 
        rotation={[slopeAngle, 0, 0]}
        friction={0.1} 
        restitution={0.2} 
      />
    </RigidBody>
  );
};
