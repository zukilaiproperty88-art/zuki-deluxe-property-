import * as THREE from 'three';

// Helper to get a random point inside a sphere
export const getRandomSpherePoint = (radius: number): THREE.Vector3 => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(Math.random()) * radius;
  
  const sinPhi = Math.sin(phi);
  return new THREE.Vector3(
    r * sinPhi * Math.cos(theta),
    r * sinPhi * Math.sin(theta),
    r * Math.cos(phi)
  );
};

// Helper to get a point on a spiral cone (Christmas Tree shape)
export const getTreePoint = (
  height: number, 
  baseRadius: number, 
  ratio: number, // 0 to 1, position along height
  offsetAngle: number
): THREE.Vector3 => {
  const y = (ratio - 0.5) * height; // Center vertically
  
  // Radius decreases as we go up
  const currentRadius = baseRadius * (1 - ratio);
  
  // Spiral logic
  const angle = offsetAngle + (ratio * Math.PI * 15); // 15 turns
  
  const x = Math.cos(angle) * currentRadius;
  const z = Math.sin(angle) * currentRadius;

  return new THREE.Vector3(x, y, z);
};
