import React, { useMemo, useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { TreeState, ParticleData } from '../types';
import { getRandomSpherePoint, getTreePoint } from '../utils';

interface MorphingInstancesProps {
  count: number;
  state: TreeState;
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  type: 'needles' | 'ornaments';
  colors: string[];
}

export const MorphingInstances: React.FC<MorphingInstancesProps> = ({
  count,
  state,
  geometry,
  material,
  type,
  colors
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Pre-calculate positions for both states
  const particles = useMemo(() => {
    const data: ParticleData[] = [];
    const colorObj = new THREE.Color();

    for (let i = 0; i < count; i++) {
      // SCATTER STATE: Random sphere distribution
      const scatterPos = getRandomSpherePoint(12); // Large scatter radius

      // TREE STATE: Spiral Cone
      const ratio = i / count;
      // Add some randomness to ratio so the spiral isn't perfectly linear index-wise
      const randomizedRatio = Math.max(0, Math.min(1, ratio + (Math.random() * 0.1 - 0.05)));
      
      const treePos = getTreePoint(
        10, // Height
        3.5, // Base Radius
        randomizedRatio,
        i * 0.5 // Offset angle
      );
      
      // Add jitter to tree position for volume
      treePos.x += (Math.random() - 0.5) * 0.5;
      treePos.z += (Math.random() - 0.5) * 0.5;
      treePos.y += (Math.random() - 0.5) * 0.2;

      // Scale variation
      const scale = type === 'ornaments' 
        ? Math.random() * 0.4 + 0.2 
        : Math.random() * 0.15 + 0.05;

      // Rotation
      const rotation = new THREE.Euler(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );

      // Color selection
      const colorHex = colors[Math.floor(Math.random() * colors.length)];
      const color = new THREE.Color(colorHex);

      data.push({
        id: i,
        scatterPosition: scatterPos,
        treePosition: treePos,
        rotation,
        scale,
        color
      });
    }
    return data;
  }, [count, type, colors]);

  // Initial setup for colors
  useLayoutEffect(() => {
    if (meshRef.current) {
      particles.forEach((p, i) => {
        if (p.color) {
          meshRef.current!.setColorAt(i, p.color);
        }
      });
      meshRef.current.instanceColor!.needsUpdate = true;
    }
  }, [particles]);

  // Animation Loop
  useFrame((stateThree, delta) => {
    if (!meshRef.current) return;

    // Determine target lerp value based on state
    // We dampen a "progress" variable to smooth the transition
    const targetProgress = state === TreeState.TREE_SHAPE ? 1 : 0;
    
    // Smooth dampening factor
    const damping = 2.5 * delta;

    particles.forEach((p, i) => {
      // Get current matrix to extract current position (optional for exact physics, 
      // but here we simply re-calculate based on a global progress t for stability)
      
      // However, to make it truly organic, let's use a specialized time-based interpolation
      // We'll use a unique phase for each particle to break uniformity
      const time = stateThree.clock.getElapsedTime();
      
      // To implement state transition, we actually need to store the current visual state
      // But standard React state is too slow for 1000s of particles.
      // We will interpolate positions directly.
      
      // Let's create a "visual progress" that moves towards targetProgress
      // Note: In a real physics engine we'd use velocity, here we cheat with simple lerp on the GPU or CPU loop.
      // Since we can't easily store 5000 distinct "currentProgress" values without a ref array,
      // we will use a global approach with per-particle noise.
      
      // Use the global stateRef or just assume the transition happens over ~2 seconds
      // For this simplified demo, we calculate position based on `p.currentPos` if we had it.
      // Instead, we will lerp the vectors directly using a computed factor.
      
      // We need a persistent transition value. Let's use a ref to track the global transition 't'
      // Ideally this is passed as a uniform, but for <5000 objects, CPU calc is fine.
    });

    // Re-implementation of the loop for cleaner state management:
    // We will use a ref to track the actual interpolated value (0 to 1)
    
    // Update the ref value
    if (meshRef.current.userData.t === undefined) meshRef.current.userData.t = 0;
    
    const currentT = meshRef.current.userData.t;
    const diff = targetProgress - currentT;
    
    // Non-linear approach
    if (Math.abs(diff) > 0.001) {
       meshRef.current.userData.t += diff * damping;
    } else {
       meshRef.current.userData.t = targetProgress;
    }

    const t = meshRef.current.userData.t;

    particles.forEach((p, i) => {
      // Lerp position
      const pos = new THREE.Vector3().copy(p.scatterPosition).lerp(p.treePosition, t);
      
      // Add floating noise when in scatter mode
      if (t < 0.9) {
        const time = stateThree.clock.getElapsedTime();
        const noiseX = Math.sin(time + p.id * 0.1) * (1 - t) * 0.5;
        const noiseY = Math.cos(time + p.id * 0.1) * (1 - t) * 0.5;
        pos.add(new THREE.Vector3(noiseX, noiseY, 0));
      }

      // Add rotation (continuous spin)
      const time = stateThree.clock.getElapsedTime();
      dummy.position.copy(pos);
      dummy.rotation.set(
        p.rotation.x + time * 0.2,
        p.rotation.y + time * 0.2,
        p.rotation.z
      );
      dummy.scale.setScalar(p.scale);
      dummy.updateMatrix();

      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    // @ts-ignore
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, count]}
      castShadow
      receiveShadow
    />
  );
};