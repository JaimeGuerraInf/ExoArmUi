import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Componente para el tejido muscular con efecto realista
const MuscleTissue = ({ position, scale, rotation, color, activation = 0 }) => {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      // Simulación de contracción muscular
      const pulse = 1 + (Math.sin(Date.now() * 0.005) * 0.05 * activation);
      meshRef.current.scale.set(scale[0], scale[1] * pulse, scale[2]);
    }
  });

  return (
    <mesh ref={meshRef} position={position} rotation={rotation}>
      <cylinderGeometry args={[0.15, 0.12, 1, 32, 8]} />
      <MeshTransmissionMaterial
        backside={true}
        samples={16}
        resolution={512}
        transmission={0.95}
        roughness={0.2}
        thickness={0.5}
        ior={1.5}
        chromaticAberration={0.06}
        anisotropy={0.1}
        distortion={0.0}
        distortionScale={0.3}
        temporalDistortion={0.0}
        attenuationDistance={0.5}
        color={color}
        attenuationColor={color}
      />
    </mesh>
  );
};

// Componente para los tendones
const Tendon = ({ start, end, thickness = 0.03 }) => {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(...start),
    new THREE.Vector3(...end)
  ]);

  const tubeGeometry = new THREE.TubeGeometry(curve, 8, thickness, 8, false);

  return (
    <mesh geometry={tubeGeometry}>
      <meshStandardMaterial
        color="#F0F0F0"
        roughness={0.3}
        metalness={0.2}
        opacity={0.9}
        transparent
      />
    </mesh>
  );
};

// Componente para el hueso con detalles anatómicos
const Bone = ({ position, rotation }) => {
  return (
    <group position={position} rotation={rotation}>
      {/* Corteza ósea */}
      <mesh>
        <cylinderGeometry args={[0.08, 0.08, 1.2, 16]} />
        <meshStandardMaterial
          color="#E0E0E0"
          roughness={0.3}
          metalness={0.2}
        />
      </mesh>
      
      {/* Periostio (membrana que recubre el hueso) */}
      <mesh>
        <cylinderGeometry args={[0.082, 0.082, 1.19, 16]} />
        <meshStandardMaterial
          color="#FFF5E6"
          transparent
          opacity={0.3}
          roughness={0.1}
        />
      </mesh>
    </group>
  );
};

// Componente principal del brazo anatómico
const AnatomicalArm = ({ angle }) => {
  const armRef = useRef();
  
  const angleToRadians = (angle) => {
    if (angle === null) return 0;
    const normalizedAngle = (angle - 30) / (135 - 30);
    return (1 - normalizedAngle) * (Math.PI / 2);
  };

  const calculateMuscleActivation = (angle) => {
    if (angle === null) return { biceps: 0, triceps: 0 };
    const normalizedAngle = (angle - 30) / (135 - 30);
    return {
      biceps: Math.max(0, Math.min(1, 1 - normalizedAngle)),
      triceps: Math.max(0, Math.min(1, normalizedAngle))
    };
  };

  const muscleActivation = calculateMuscleActivation(angle);

  return (
    <group ref={armRef}>
      {/* Húmero */}
      <Bone position={[0, 0.5, 0]} />
      
      {/* Articulación del codo */}
      <group position={[0, 0, 0]}>
        {/* Cápsula articular */}
        <mesh>
          <sphereGeometry args={[0.12, 32, 32]} />
          <meshStandardMaterial
            color="#E6E6FA"
            transparent
            opacity={0.6}
            roughness={0.2}
          />
        </mesh>
      </group>

      {/* Cúbito y radio */}
      <group rotation={[0, 0, angleToRadians(angle)]}>
        <Bone position={[0, -0.5, 0]} />
      </group>

      {/* Bíceps braquial */}
      <group>
        <MuscleTissue
          position={[0.2, 0.3, 0]}
          scale={[1, 1, 1]}
          rotation={[0, 0, -Math.PI * 0.1]}
          color="#FF6B6B"
          activation={muscleActivation.biceps}
        />
        {/* Tendón del bíceps */}
        <Tendon
          start={[0.2, -0.1, 0]}
          end={[0.1, -0.2, 0]}
          thickness={0.02}
        />
      </group>

      {/* Tríceps braquial */}
      <group>
        <MuscleTissue
          position={[-0.2, 0.3, 0]}
          scale={[1, 1, 1]}
          rotation={[0, 0, Math.PI * 0.1]}
          color="#4ECDC4"
          activation={muscleActivation.triceps}
        />
        {/* Tendón del tríceps */}
        <Tendon
          start={[-0.2, -0.1, 0]}
          end={[-0.1, -0.2, 0]}
          thickness={0.02}
        />
      </group>

      {/* Fascia muscular */}
      <mesh>
        <cylinderGeometry args={[0.3, 0.25, 1.4, 32]} />
        <meshStandardMaterial
          color="#FFFFFF"
          transparent
          opacity={0.1}
          roughness={0.1}
        />
      </mesh>
    </group>
  );
};

const ArmVisualization3D = ({ angle }) => {
  return (
    <div style={{ width: '100%', height: '300px', position: 'relative' }}>
      <Canvas
        camera={{ position: [0, 0, 4], fov: 45 }}
        style={{ background: '#1a1b26' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        <spotLight
          position={[0, 5, 0]}
          angle={0.3}
          penumbra={1}
          intensity={1}
          distance={10}
        />

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={8}
        />

        <AnatomicalArm angle={angle} />

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
          <planeGeometry args={[8, 8]} />
          <meshStandardMaterial color="#2D2B55" />
        </mesh>

        <gridHelper args={[8, 8, '#6EF3C5', '#2D2B55']} position={[0, -1.5, 0]} />
      </Canvas>

      {/* Overlay con información del ángulo */}
      <div
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          background: 'rgba(26, 27, 38, 0.8)',
          padding: '8px',
          borderRadius: '4px',
          color: '#fff',
          fontSize: '0.9em'
        }}
      >
        <div>Ángulo: {angle ? `${Math.round(angle)}°` : 'N/A'}</div>
      </div>
    </div>
  );
};

export default ArmVisualization3D; 