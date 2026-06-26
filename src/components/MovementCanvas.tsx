'use client';

import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Center } from '@react-three/drei';
import * as THREE from 'three';

interface MovementPartProps {
  name: string;
  description: string;
  color: string;
  geometryArgs: [number, number, number, number?]; // [innerRad, outerRad, thickness, teeth]
  assemblyPosition: [number, number, number]; // target assembled position
  explosionDirection: [number, number, number]; // direction it moves when exploded
  explosionFactor: number;
  hoveredPart: string | null;
  setHoveredPart: (name: string | null) => void;
  setHoveredDesc: (desc: string | null) => void;
  rotationSpeed?: number;
  oscillate?: boolean;
  tickSteps?: boolean;
}

function MovementPart({
  name,
  description,
  color,
  geometryArgs,
  assemblyPosition,
  explosionDirection,
  explosionFactor,
  hoveredPart,
  setHoveredPart,
  setHoveredDesc,
  rotationSpeed = 0,
  oscillate = false,
  tickSteps = false,
}: MovementPartProps) {
  const meshRef = useRef<THREE.Group>(null);
  const gearRef = useRef<THREE.Group>(null);
  const isHovered = hoveredPart === name;

  // Calculate position based on explosion factor
  const currentPosition = useMemo<[number, number, number]>(() => {
    return [
      assemblyPosition[0] + explosionDirection[0] * explosionFactor * 2.5,
      assemblyPosition[1] + explosionDirection[1] * explosionFactor * 2.5,
      assemblyPosition[2] + explosionDirection[2] * explosionFactor * 2.5,
    ];
  }, [assemblyPosition, explosionDirection, explosionFactor]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    if (gearRef.current) {
      if (oscillate) {
        // Balance wheel oscillation: -35deg to +35deg
        gearRef.current.rotation.y = Math.sin(time * 8) * (35 * Math.PI / 180);
      } else if (tickSteps) {
        // Escapement wheel: 8 ticks per second
        const ticksPerSec = 8;
        const totalTicks = Math.floor(time * ticksPerSec);
        gearRef.current.rotation.y = totalTicks * (Math.PI / 15);
      } else if (rotationSpeed !== 0) {
        // Smooth gear rotation
        gearRef.current.rotation.y = time * rotationSpeed;
      }
    }
  });

  return (
    <group 
      ref={meshRef} 
      position={currentPosition}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHoveredPart(name);
        setHoveredDesc(description);
      }}
      onPointerOut={() => {
        setHoveredPart(null);
        setHoveredDesc(null);
      }}
    >
      <group ref={gearRef}>
        {/* Render a ring/cylinder representing a watch movement gear component */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[geometryArgs[0], geometryArgs[1], geometryArgs[2], geometryArgs[3] || 32]} />
          <meshStandardMaterial 
            color={isHovered ? '#E8D5A3' : color} 
            metalness={0.9} 
            roughness={isHovered ? 0.05 : 0.25}
            emissive={isHovered ? '#B8A16A' : '#000000'}
            emissiveIntensity={isHovered ? 0.3 : 0}
          />
        </mesh>

        {/* Adding teeth to make it look mechanical */}
        {geometryArgs[3] !== undefined && geometryArgs[3] > 0 && (
          <group>
            {(() => {
              const teethCount = geometryArgs[3];
              return Array.from({ length: teethCount }).map((_, i) => {
                const angle = (i * Math.PI * 2) / teethCount;
                const r = geometryArgs[1];
                return (
                  <mesh 
                    key={i} 
                    position={[Math.sin(angle) * r, 0, -Math.cos(angle) * r]} 
                    rotation={[0, -angle, 0]}
                  >
                    <boxGeometry args={[0.06, geometryArgs[2], 0.08]} />
                    <meshStandardMaterial 
                      color={isHovered ? '#E8D5A3' : color} 
                      metalness={0.9} 
                      roughness={0.25}
                      emissive={isHovered ? '#B8A16A' : '#000000'}
                      emissiveIntensity={isHovered ? 0.3 : 0}
                    />
                  </mesh>
                );
              });
            })()}
          </group>
        )}
      </group>
    </group>
  );
}

interface MovementCanvasProps {
  scrollProgress: number; // 0 (assembled) -> 1 (exploded)
}

export default function MovementCanvas({ scrollProgress }: MovementCanvasProps) {
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);
  const [hoveredDesc, setHoveredDesc] = useState<string | null>(null);

  // Define components in the mechanical assembly
  const parts = useMemo(() => [
    {
      name: 'Rotor Weight',
      description: 'Oscillates with arm movement, automatically winding the mainspring.',
      color: '#C4C6CB',
      geometryArgs: [1.2, 1.8, 0.08, 0] as [number, number, number, number],
      assemblyPosition: [0, 0.6, 0] as [number, number, number],
      explosionDirection: [0, 1.2, 0] as [number, number, number],
      rotationSpeed: 0.8,
    },
    {
      name: 'Mainspring Barrel',
      description: 'Stores mechanical energy and provides power reserve of 72 hours.',
      color: '#B8A16A',
      geometryArgs: [0, 1.1, 0.15, 32] as [number, number, number, number],
      assemblyPosition: [0.7, 0.3, 0.3] as [number, number, number],
      explosionDirection: [0.7, 0.6, 0.3] as [number, number, number],
      rotationSpeed: 0.1,
    },
    {
      name: 'Going Train: Center Wheel',
      description: 'Drives the hour hand, rotating once every 12 hours.',
      color: '#E8D5A3',
      geometryArgs: [0.1, 0.9, 0.06, 24] as [number, number, number, number],
      assemblyPosition: [0, 0.1, 0] as [number, number, number],
      explosionDirection: [0, 0.3, 0] as [number, number, number],
      rotationSpeed: 0.2,
    },
    {
      name: 'Going Train: Third & Fourth Wheels',
      description: 'Multiplies rotation speed to drive the seconds and minutes indicators.',
      color: '#B8A16A',
      geometryArgs: [0.08, 0.7, 0.06, 20] as [number, number, number, number],
      assemblyPosition: [-0.6, 0.1, -0.4] as [number, number, number],
      explosionDirection: [-0.6, 0.3, -0.4] as [number, number, number],
      rotationSpeed: 0.6,
    },
    {
      name: 'Escapement Wheel',
      description: 'Releases energy in controlled pulses (28,800 beats per hour).',
      color: '#B8A16A',
      geometryArgs: [0.05, 0.5, 0.05, 15] as [number, number, number, number],
      assemblyPosition: [-1.1, 0.0, 0.2] as [number, number, number],
      explosionDirection: [-1.1, -0.2, 0.2] as [number, number, number],
      tickSteps: true,
    },
    {
      name: 'Pallet Fork',
      description: 'Locks and unlocks the escapement, transferring impulse to the balance.',
      color: '#C4C6CB',
      geometryArgs: [0.05, 0.3, 0.06, 0] as [number, number, number, number],
      assemblyPosition: [-1.2, -0.1, 0.6] as [number, number, number],
      explosionDirection: [-1.2, -0.4, 0.6] as [number, number, number],
      oscillate: true,
    },
    {
      name: 'Balance Wheel & Hairspring',
      description: 'The heartbeat of the watch, regulating time through steady oscillation.',
      color: '#E8D5A3',
      geometryArgs: [0.9, 1.0, 0.08, 0] as [number, number, number, number],
      assemblyPosition: [-0.8, -0.2, 1.1] as [number, number, number],
      explosionDirection: [-0.8, -0.7, 1.1] as [number, number, number],
      oscillate: true,
    },
    {
      name: 'Ruby Jewels (35 Synthetic Rubies)',
      description: 'Hardened synthetic rubies providing near-frictionless pivot bearings.',
      color: '#FF1493',
      geometryArgs: [0.0, 0.15, 0.08, 0] as [number, number, number, number],
      assemblyPosition: [0.2, -0.3, -0.5] as [number, number, number],
      explosionDirection: [0.2, -1.0, -0.5] as [number, number, number],
    },
  ], []);

  return (
    <div className="w-full h-full relative">
      {/* 3D Canvas */}
      <Canvas 
        camera={{ position: [0, 3.5, 5.5], fov: 40 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={1.5} color="#E8D5A3" />
        <pointLight position={[-5, -5, -5]} intensity={0.5} color="#ffffff" />
        <directionalLight position={[0, 5, 0]} intensity={1} />
        
        <Center>
          {parts.map((part, idx) => (
            <MovementPart 
              key={idx}
              name={part.name}
              description={part.description}
              color={part.color}
              geometryArgs={part.geometryArgs}
              assemblyPosition={part.assemblyPosition}
              explosionDirection={part.explosionDirection}
              explosionFactor={scrollProgress}
              hoveredPart={hoveredPart}
              setHoveredPart={setHoveredPart}
              setHoveredDesc={setHoveredDesc}
              rotationSpeed={part.rotationSpeed}
              oscillate={part.oscillate}
              tickSteps={part.tickSteps}
            />
          ))}
        </Center>
        
        <OrbitControls enableZoom={true} enablePan={false} />
      </Canvas>

      {/* Floating Tooltip Label */}
      {hoveredPart && (
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-veltora-charcoal/95 border border-veltora-gold/30 rounded-xl px-5 py-4 w-72 text-center pointer-events-none backdrop-blur-md transition-all duration-300 shadow-2xl animate-fade-in">
          <div className="text-veltora-gold font-bold text-base tracking-wider uppercase mb-1">
            {hoveredPart}
          </div>
          <div className="text-veltora-cream/80 text-xs leading-relaxed font-body">
            {hoveredDesc}
          </div>
        </div>
      )}
    </div>
  );
}
