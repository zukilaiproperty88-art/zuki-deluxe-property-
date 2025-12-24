import * as THREE from 'three';

export enum TreeState {
  SCATTERED = 'SCATTERED',
  TREE_SHAPE = 'TREE_SHAPE'
}

export interface ParticleData {
  id: number;
  scatterPosition: THREE.Vector3;
  treePosition: THREE.Vector3;
  rotation: THREE.Euler;
  scale: number;
  color?: THREE.Color;
}
