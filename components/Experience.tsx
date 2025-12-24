import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Float, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { TreeState } from '../types';
import { MorphingInstances } from './MorphingInstances';

// Extend JSX.IntrinsicElements to include React Three Fiber elements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      ambientLight: any;
      pointLight: any;
      spotLight: any;
      color: any;
      group: any;
      mesh: any;
      meshStandardMaterial: any;
    }
  }
}

interface ExperienceProps {
  treeState: TreeState;
}

export const Experience: React.FC<ExperienceProps> = ({ treeState }) => {
  // 1. Needles Geometry & Material (Emerald/Green/Dark)
  const needleGeo = useMemo(() => new THREE.ConeGeometry(0.2, 0.8, 3), []); // Tetrahedrons look sharp/expensive
  const needleMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#004D25', // Deep Emerald
    emissive: '#001a05',
    roughness: 0.15, // Smoother for more luxury shine
    metalness: 0.2,
    reflectivity: 0.6,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
  }), []);

  // 2. Ornaments Geometry & Material (Gold/Luxury)
  const ornamentGeo = useMemo(() => new THREE.IcosahedronGeometry(0.5, 0), []); // Low poly diamonds
  const ornamentMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#D4AF37', // Gold
    emissive: '#553300',
    roughness: 0.0, // Mirror finish
    metalness: 1,
    clearcoat: 1,
  }), []);

  // 3. The Star (Separate Instance for special glow)
  const starGeo = useMemo(() => new THREE.OctahedronGeometry(1.5, 0), []);
  
  return (
    <>
      <color attach="background" args={['#050505']} />
      
      {/* Controls */}
      <OrbitControls 
        enablePan={false} 
        minPolarAngle={Math.PI / 4} 
        maxPolarAngle={Math.PI / 1.8}
        autoRotate={treeState === TreeState.TREE_SHAPE}
        autoRotateSpeed={0.5}
      />

      {/* Lighting - Moody and Cinematic */}
      <ambientLight intensity={0.3} />
      <spotLight 
        position={[10, 20, 10]} 
        angle={0.3} 
        penumbra={1} 
        intensity={300} 
        color="#fff0d0" 
        castShadow 
      />
      <pointLight position={[-10, 5, -10]} intensity={80} color="#00ff88" />
      <pointLight position={[10, -5, 10]} intensity={80} color="#ffaa00" />

      {/* Environment Reflections */}
      <Environment preset="city" />

      {/* The Morphing Tree Components */}
      <group position={[0, -2, 0]}>
        {/* Emerald Needles */}
        <MorphingInstances 
          count={2500} 
          state={treeState} 
          geometry={needleGeo} 
          material={needleMat}
          type="needles"
          colors={['#004d25', '#005c2e', '#003319']}
        />

        {/* Gold Ornaments */}
        <MorphingInstances 
          count={350} 
          state={treeState} 
          geometry={ornamentGeo} 
          material={ornamentMat}
          type="ornaments"
          colors={['#D4AF37', '#FFD700', '#CD7F32']}
        />
        
        {/* The Top Star */}
        <Star state={treeState} geometry={starGeo} />
      </group>

      {/* Ambient particles for magical feel - Increased for Deluxe feel */}
      <Sparkles count={800} scale={25} size={6} speed={0.4} opacity={0.6} color="#F9E076" />

      {/* Post Processing for the Signature Look */}
      <EffectComposer disableNormalPass>
        <Bloom 
          luminanceThreshold={0.7} 
          mipmapBlur 
          intensity={2.0} 
          radius={0.6}
        />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </>
  );
};

// Helper component for the Star
const Star: React.FC<{state: TreeState, geometry: THREE.BufferGeometry}> = ({ state, geometry }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const targetPos = new THREE.Vector3(0, 10.5, 0); // Top of tree
  const scatterPos = new THREE.Vector3(0, 15, 0); // Floating high up

  useFrame((_, delta) => {
    if(!meshRef.current) return;
    const target = state === TreeState.TREE_SHAPE ? targetPos : scatterPos;
    meshRef.current.position.lerp(target, delta * 2);
    meshRef.current.rotation.y += delta * 0.5;
    
    // Pulse scale
    const s = 1 + Math.sin(_.clock.elapsedTime * 2) * 0.1;
    meshRef.current.scale.setScalar(s);
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial 
        color="#fff" 
        emissive="#F9E076" 
        emissiveIntensity={3} 
        toneMapped={false} 
      />
    </mesh>
  );
};