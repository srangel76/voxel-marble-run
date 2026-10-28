import React from 'react';
import { CuboidCollider, RigidBody } from '@react-three/rapier';

interface BlockProps {
  position: [number, number, number];
  rotation: number;
}

export const CurveBlock: React.FC<BlockProps> = ({ position, rotation }) => {
  const rotY = (rotation * Math.PI) / 2;

  return (
    <RigidBody type="fixed" position={position} rotation={[0, rotY, 0]} colliders={false}>
      <group>
        {/* Base foundation */}
        <mesh position={[0, -0.25, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.98, 0.5, 0.98]} />
          <meshStandardMaterial color="#1e293b" roughness={0.7} />
        </mesh>

        {/* Curved Track Floor runner (Cyan curved surface) */}
        <mesh position={[0, 0.01, 0]} receiveShadow>
          <boxGeometry args={[0.96, 0.03, 0.96]} />
          <meshStandardMaterial color="#0284c7" roughness={0.2} metalness={0.1} />
        </mesh>

        {/* Outer Corner Block (Outer wall) */}
        <mesh position={[-0.35, 0.2, 0.35]} castShadow receiveShadow>
          <boxGeometry args={[0.26, 0.44, 0.26]} />
          <meshStandardMaterial color="#334155" roughness={0.4} />
        </mesh>
        {/* Outer Angled Deflection Wall */}
        <mesh position={[-0.15, 0.2, 0.35]} rotation={[0, Math.PI / 4, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.42, 0.44, 0.2]} />
          <meshStandardMaterial color="#0ea5e9" roughness={0.3} metalness={0.2} />
        </mesh>

        {/* Outer Entrance Guide Wall */}
        <mesh position={[-0.36, 0.2, -0.22]} castShadow receiveShadow>
          <boxGeometry args={[0.24, 0.44, 0.52]} />
          <meshStandardMaterial color="#334155" roughness={0.4} />
        </mesh>
        <mesh position={[-0.245, 0.35, -0.22]}>
          <boxGeometry args={[0.03, 0.14, 0.52]} />
          <meshStandardMaterial color="#38bdf8" />
        </mesh>

        {/* Outer Exit Guide Wall */}
        <mesh position={[0.22, 0.2, 0.36]} castShadow receiveShadow>
          <boxGeometry args={[0.52, 0.44, 0.24]} />
          <meshStandardMaterial color="#334155" roughness={0.4} />
        </mesh>
        <mesh position={[0.22, 0.35, 0.245]}>
          <boxGeometry args={[0.52, 0.14, 0.03]} />
          <meshStandardMaterial color="#38bdf8" />
        </mesh>

        {/* Inner Corner Guide Post */}
        <mesh position={[0.36, 0.2, -0.36]} castShadow receiveShadow>
          <boxGeometry args={[0.24, 0.44, 0.24]} />
          <meshStandardMaterial color="#334155" roughness={0.4} />
        </mesh>
        <mesh position={[0.28, 0.35, -0.28]}>
          <boxGeometry args={[0.1, 0.14, 0.1]} />
          <meshStandardMaterial color="#38bdf8" />
        </mesh>
      </group>

      {/* Physics Colliders - Compound */}
      {/* 1. Track Floor: supports the entire turn area with boundary overlap for smooth transition */}
      <CuboidCollider 
        args={[0.502, 0.25, 0.502]} 
        position={[0, -0.25, 0]} 
        friction={0.1} 
        restitution={0.2} 
      />

      {/* 2. Outer entrance wall */}
      <CuboidCollider 
        args={[0.13, 0.35, 0.26]} 
        position={[-0.37, 0.15, -0.24]} 
        friction={0.1} 
        restitution={0.2} 
      />

      {/* 3. Outer exit wall */}
      <CuboidCollider 
        args={[0.26, 0.35, 0.13]} 
        position={[0.24, 0.15, 0.37]} 
        friction={0.1} 
        restitution={0.2} 
      />

      {/* 4. Outer 45-degree deflection banking wall */}
      <CuboidCollider 
        args={[0.25, 0.35, 0.12]} 
        position={[-0.15, 0.15, 0.32]} 
        rotation={[0, Math.PI / 4, 0]}
        friction={0.1} 
        restitution={0.2} 
      />

      {/* 5. Outer corner backstop to avoid corner punch-through */}
      <CuboidCollider 
        args={[0.15, 0.35, 0.15]} 
        position={[-0.36, 0.15, 0.36]} 
        friction={0.1} 
        restitution={0.2} 
      />

      {/* 6. Inner corner post */}
      <CuboidCollider 
        args={[0.13, 0.35, 0.13]} 
        position={[0.37, 0.15, -0.37]} 
        friction={0.1} 
        restitution={0.2} 
      />
    </RigidBody>
  );
};
