import React from 'react';
import { CuboidCollider, RigidBody } from '@react-three/rapier';

interface BlockProps {
  position: [number, number, number];
  rotation: number;
}

export const SupportBlock: React.FC<BlockProps> = ({ position, rotation }) => {
  const rotY = (rotation * Math.PI) / 2;

  return (
    <RigidBody type="fixed" position={position} rotation={[0, rotY, 0]} colliders={false}>
      {/* Visual Mesh */}
      <group>
        {/* Main support cube */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.98, 0.98, 0.98]} />
          <meshStandardMaterial color="#334155" roughness={0.6} metalness={0.2} />
        </mesh>
        
        {/* Top accent cap */}
        <mesh position={[0, 0.47, 0]} receiveShadow>
          <boxGeometry args={[0.92, 0.05, 0.92]} />
          <meshStandardMaterial color="#475569" roughness={0.4} metalness={0.3} />
        </mesh>

        {/* Decorative corner pillars */}
        {[-0.42, 0.42].map((x, i) =>
          [-0.42, 0.42].map((z, j) => (
            <mesh key={`${i}-${j}`} position={[x, 0, z]}>
              <boxGeometry args={[0.12, 0.99, 0.12]} />
              <meshStandardMaterial color="#64748b" roughness={0.3} metalness={0.4} />
            </mesh>
          ))
        )}
      </group>

      {/* Physics Collider */}
      <CuboidCollider args={[0.5, 0.5, 0.5]} position={[0, 0, 0]} friction={0.1} restitution={0.2} />
    </RigidBody>
  );
};
