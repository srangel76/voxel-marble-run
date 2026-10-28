import React from 'react';
import { CuboidCollider, RigidBody } from '@react-three/rapier';

interface GridPlaneProps {
  size?: number;
  onPointerMove?: (e: any) => void;
  onPointerDown?: (e: any) => void;
}

export const GridPlane: React.FC<GridPlaneProps> = ({ 
  size = 16, 
  onPointerMove, 
  onPointerDown 
}) => {
  return (
    <group position={[0, -0.5, 0]}>
      {/* Visual Base Board Floor */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.01, 0]} 
        receiveShadow
        onPointerMove={onPointerMove}
        onPointerDown={onPointerDown}
      >
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial 
          color="#0f172a" 
          roughness={0.8} 
          metalness={0.1}
        />
      </mesh>

      {/* Grid lines overlay */}
      <gridHelper 
        args={[size, size, '#38bdf8', '#1e293b']} 
        position={[0, 0.005, 0]} 
      />

      {/* Outer border trim */}
      <mesh position={[0, -0.06, 0]}>
        <boxGeometry args={[size + 0.4, 0.1, size + 0.4]} />
        <meshStandardMaterial color="#0284c7" roughness={0.5} metalness={0.4} />
      </mesh>

      {/* Physical Collider for Ground in Play Mode */}
      <RigidBody type="fixed" colliders={false} position={[0, -0.1, 0]}>
        <CuboidCollider 
          args={[size / 2, 0.1, size / 2]} 
          friction={0.2} 
          restitution={0.1} 
        />
      </RigidBody>
    </group>
  );
};
