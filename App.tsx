import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Loader } from '@react-three/drei';
import { Experience } from './components/Experience';
import { TreeState } from './types';
import { Sparkles as SparklesIcon, Zap } from 'lucide-react';

const App: React.FC = () => {
  const [treeState, setTreeState] = useState<TreeState>(TreeState.SCATTERED);
  const [audioStarted, setAudioStarted] = useState(false);

  const toggleState = () => {
    // Optional: Add sound effect trigger here
    setTreeState((prev) => 
      prev === TreeState.SCATTERED ? TreeState.TREE_SHAPE : TreeState.SCATTERED
    );
    if (!audioStarted) setAudioStarted(true);
  };

  return (
    <div className="relative w-full h-full bg-zuki-black">
      {/* 3D Canvas */}
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 0, 25], fov: 45 }}
        gl={{ antialias: false, toneMappingExposure: 1.5 }}
      >
        <Suspense fallback={null}>
          <Experience treeState={treeState} />
        </Suspense>
      </Canvas>
      <Loader />

      {/* UI Overlay */}
      <main className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 md:p-12 z-10">
        
        {/* Header */}
        <header className="flex flex-col items-start space-y-2 animate-fade-in select-none">
          <h1 className="text-zuki-gold font-serif text-3xl md:text-5xl tracking-wider drop-shadow-lg">
            DELUXE PROPERTY <span className="text-white text-xl md:text-3xl italic font-light opacity-90 block md:inline mt-1 md:mt-0">Zuki</span>
          </h1>
          <div className="h-[1px] w-32 bg-gradient-to-r from-zuki-gold to-transparent"></div>
          <p className="text-zuki-gold-light font-sans text-xs tracking-[0.25em] uppercase opacity-80">
            Exclusive Christmas Edition
          </p>
        </header>

        {/* Controls */}
        <div className="flex flex-col items-center justify-end pointer-events-auto pb-8">
            <button
              onClick={toggleState}
              className={`
                group relative px-10 py-5 bg-zuki-emerald-dark/80 backdrop-blur-md 
                border border-zuki-gold/40 rounded-full 
                transition-all duration-700 ease-out
                hover:border-zuki-gold hover:bg-zuki-emerald-dark hover:shadow-[0_0_40px_rgba(212,175,55,0.4)]
                flex items-center space-x-4 overflow-hidden
              `}
            >
              {/* Button Background Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zuki-gold/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

              <span className="text-zuki-gold group-hover:text-white transition-colors duration-300">
                {treeState === TreeState.SCATTERED ? <Zap size={22} /> : <SparklesIcon size={22} />}
              </span>
              
              <span className="font-serif text-lg text-zuki-gold-light tracking-widest group-hover:text-white transition-colors duration-300">
                {treeState === TreeState.SCATTERED ? 'ASSEMBLE' : 'SCATTER'}
              </span>
            </button>
            
            <p className="mt-6 text-zuki-gold/50 text-[10px] tracking-widest uppercase font-sans">
              Drag to Rotate &bull; Scroll to Zoom
            </p>
        </div>
      </main>
    </div>
  );
};

export default App;