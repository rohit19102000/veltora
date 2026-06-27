'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Center } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '@/lib/useStore';

// Case Finish Materials mapping
const CASE_FINISHES = {
  gold: {
    color: '#D4AF37',
    metalness: 0.95,
    roughness: 0.15,
  },
  rose_gold: {
    color: '#B76E79',
    metalness: 0.95,
    roughness: 0.18,
  },
  white_gold: {
    color: '#E6E6FA',
    metalness: 0.95,
    roughness: 0.1,
  },
  titanium: {
    color: '#8C8C8C',
    metalness: 0.8,
    roughness: 0.35,
  },
  dlc_black: {
    color: '#1A1A1A',
    metalness: 0.9,
    roughness: 0.25,
  },
};

function WatchModel() {
  const caseFinish = useStore((state) => state.caseFinish);
  const dialColor = useStore((state) => state.dialColor);
  const indexStyle = useStore((state) => state.indexStyle);
  const strapType = useStore((state) => state.strapType);
  const initials = useStore((state) => state.initials);
  const explodeProgress = useStore((state) => state.explodeProgress);
  const xRayMode = useStore((state) => state.xRayMode);
  const escapementVph = useStore((state) => state.escapementVph);

  const groupRef = useRef<THREE.Group>(null);
  const hourHandRef = useRef<THREE.Group>(null);
  const minuteHandRef = useRef<THREE.Group>(null);
  const secondHandRef = useRef<THREE.Group>(null);
  const gear1Ref = useRef<THREE.Mesh>(null);
  const gear2Ref = useRef<THREE.Mesh>(null);
  const balanceWheelRef = useRef<THREE.Group>(null);

  // Load strap textures from Higgsfield-generated files using THREE.TextureLoader
  const strapTexture = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const loader = new THREE.TextureLoader();
    try {
      const tex = loader.load(`/assets/swatch_${strapType}.png`);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(1, 4);
      return tex;
    } catch {
      return null;
    }
  }, [strapType]);

  // Dynamic Caseback Canvas for initials engraving
  const canvasTexture = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0A0A0B';
      ctx.fillRect(0, 0, 256, 256);
      
      // Outer border circle
      ctx.strokeStyle = '#B8A16A';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(128, 128, 110, 0, Math.PI * 2);
      ctx.stroke();

      // Brand tag
      ctx.fillStyle = '#8A8E96';
      ctx.font = '16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('VELTORA GENÈVE', 128, 70);

      // Engraved initials
      ctx.fillStyle = '#E8D5A3';
      ctx.font = 'bold 48px Cormorant Garamond, serif';
      ctx.fillText(initials || 'V-9', 128, 140);

      ctx.fillStyle = '#8A8E96';
      ctx.font = '14px monospace';
      ctx.fillText('300 HOURS · SWISS MADE', 128, 190);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, [initials]);

  // Update canvas texture on change
  useEffect(() => {
    if (canvasTexture) {
      canvasTexture.needsUpdate = true;
    }
  }, [initials, canvasTexture]);

  // Case Finish PBR properties
  const caseMatProps = useMemo(() => {
    return CASE_FINISHES[caseFinish] || CASE_FINISHES.gold;
  }, [caseFinish]);

  // Animate watch hands in real time
  useFrame(() => {
    const date = new Date();
    const sec = date.getSeconds() + date.getMilliseconds() / 1000;
    const min = date.getMinutes() + sec / 60;
    const hr = (date.getHours() % 12) + min / 60;

    if (secondHandRef.current) {
      secondHandRef.current.rotation.y = -sec * (Math.PI / 30);
    }
    if (minuteHandRef.current) {
      minuteHandRef.current.rotation.y = -min * (Math.PI / 30);
    }
    if (hourHandRef.current) {
      hourHandRef.current.rotation.y = -hr * (Math.PI / 6);
    }

    // Animate inner caliber skeleton gears
    const hz = escapementVph / 3600; // e.g. 8 for 28800 vph
    const gearSpeed = (escapementVph / 28800) * 0.015;
    if (gear1Ref.current) {
      gear1Ref.current.rotation.z += gearSpeed;
    }
    if (gear2Ref.current) {
      gear2Ref.current.rotation.z -= gearSpeed * 0.7;
    }
    if (balanceWheelRef.current) {
      // Oscillate balance wheel back and forth at the watch frequency
      balanceWheelRef.current.rotation.z = Math.sin(date.getTime() * 0.001 * Math.PI * hz) * 0.8;
    }

    // Auto rotate case slowly when not hovered (interacted with)
    if (groupRef.current) {
      if (explodeProgress === 0) {
        groupRef.current.rotation.y += 0.003;
        groupRef.current.rotation.x = 0;
      } else {
        // Tilt watch for cinematic 3D perspective during explosion
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 40 * Math.PI / 180, 0.1);
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 25 * Math.PI / 180, 0.1);
      }
    }
  });

  // Circular placement helper for dial indices
  const markers = useMemo(() => {
    const list = [];
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI) / 6;
      const x = Math.sin(angle) * 1.5;
      const z = -Math.cos(angle) * 1.5;
      
      let text = '';
      if (indexStyle === 'roman') {
        const roman = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
        text = roman[i];
      } else if (indexStyle === 'arabic') {
        const arabic = ['12', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];
        text = arabic[i];
      } else {
        text = '|';
      }
      
      list.push({ x, z, angle, text });
    }
    return list;
  }, [indexStyle]);

  return (
    <group ref={groupRef}>
      {/* 1. STRAP (Lugs extensions and strap bands) */}
      <group position={[0, -0.1, 0]}>
        {/* Upper Strap */}
        <mesh position={[0, 0, 2.8 + explodeProgress * 2.0]} rotation={[-0.1, 0, 0]}>
          <boxGeometry args={[1.2, 0.12, 2.4]} />
          <meshStandardMaterial 
            color={strapType === 'nato' ? '#2A3B2A' : strapType === 'calfskin' ? '#8B5A2B' : caseMatProps.color} 
            roughness={strapType === 'rubber' || strapType === 'nato' ? 0.9 : 0.4}
            metalness={strapType === 'steel' || strapType === 'titanium' ? 0.9 : 0}
            map={strapTexture}
          />
        </mesh>
        {/* Lower Strap */}
        <mesh position={[0, 0, -2.8 - explodeProgress * 2.0]} rotation={[0.1, 0, 0]}>
          <boxGeometry args={[1.2, 0.12, 2.4]} />
          <meshStandardMaterial 
            color={strapType === 'nato' ? '#2A3B2A' : strapType === 'calfskin' ? '#8B5A2B' : caseMatProps.color} 
            roughness={strapType === 'rubber' || strapType === 'nato' ? 0.9 : 0.4}
            metalness={strapType === 'steel' || strapType === 'titanium' ? 0.9 : 0}
            map={strapTexture}
          />
        </mesh>
      </group>

      {/* 2. MAIN WATCH HEAD */}
      {/* Case Outer Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[2.0, 2.0, 0.5, 64]} />
        <meshStandardMaterial {...caseMatProps} />
      </mesh>

      {/* Bezel */}
      <mesh position={[0, 0.26 + explodeProgress * 1.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.9, 1.9, 0.08, 64]} />
        <meshStandardMaterial {...caseMatProps} roughness={0.1} />
      </mesh>

      {/* Lugs */}
      {[-1.1, 1.1].map((xOffset, i) => (
        <group key={i}>
          {/* Upper Lug */}
          <mesh position={[xOffset, 0, 1.9 + explodeProgress * 0.8]} rotation={[0.2, 0, xOffset * 0.1]}>
            <boxGeometry args={[0.25, 0.35, 1.1]} />
            <meshStandardMaterial {...caseMatProps} />
          </mesh>
          {/* Lower Lug */}
          <mesh position={[xOffset, 0, -1.9 - explodeProgress * 0.8]} rotation={[-0.2, 0, -xOffset * 0.1]}>
            <boxGeometry args={[0.25, 0.35, 1.1]} />
            <meshStandardMaterial {...caseMatProps} />
          </mesh>
        </group>
      ))}

      {/* Crown */}
      <mesh position={[2.1 + explodeProgress * 0.8, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.25, 0.25, 0.3, 24]} />
        <meshStandardMaterial {...caseMatProps} roughness={0.1} />
      </mesh>

      {/* 3. CASEBACK WITH ENGRAVING */}
      <mesh position={[0, -0.26 - explodeProgress * 1.5, 0]} rotation={[Math.PI / 2, 0, Math.PI]}>
        <cylinderGeometry args={[1.85, 1.85, 0.04, 64]} />
        <meshStandardMaterial map={canvasTexture || undefined} roughness={0.3} metalness={0.8} />
      </mesh>
      {/* 4. DIAL AND REVEALS */}
      {indexStyle !== 'skeleton' ? (
        <mesh position={[0, 0.2 + explodeProgress * 0.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.8, 1.8, 0.04, 64]} />
          <meshStandardMaterial 
            color={dialColor} 
            roughness={0.1} 
            metalness={dialColor === '#0A0A0B' ? 0.8 : 0.2} 
            transparent={xRayMode}
            opacity={xRayMode ? 0.15 : 1}
          />
        </mesh>
      ) : (
        // Skeleton view: glass base showing inner gears
        <group position={[0, explodeProgress * 0.8, 0]}>
          {/* Clear center */}
          <mesh position={[0, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[1.8, 1.8, 0.02, 64]} />
            <meshPhysicalMaterial 
              color="#ffffff" 
              transmission={0.9} 
              opacity={0.3} 
              transparent 
              roughness={0.05} 
            />
          </mesh>
          {/* Outer ring for markers */}
          <mesh position={[0, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.65, 0.15, 8, 64]} />
            <meshStandardMaterial {...caseMatProps} />
          </mesh>
        </group>
      )}

      {/* 4.5. INNER CALIBER ROTATING GEARS & ESCAPEMENT BALANCE WHEEL (Visible in Skeleton or X-Ray mode) */}
      {(xRayMode || indexStyle === 'skeleton') && (
        <group position={[0, explodeProgress * 0.8, 0]}>
          {/* Gear 1: Gold center/drive gear */}
          <mesh ref={gear1Ref} position={[0.4, 0.12, -0.4]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.6, 0.6, 0.04, 24]} />
            <meshStandardMaterial color="#B8A16A" metalness={0.9} roughness={0.2} />
          </mesh>

          {/* Gear 2: Silver intermediate transmission gear */}
          <mesh ref={gear2Ref} position={[-0.4, 0.10, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.75, 0.75, 0.04, 30]} />
            <meshStandardMaterial color="#C4C6CB" metalness={0.9} roughness={0.2} />
          </mesh>

          {/* Escapement Balance Wheel (Oscillates back & forth) */}
          <group ref={balanceWheelRef} position={[0, 0.08, 0]}>
            {/* Outer Rim */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.65, 0.05, 8, 32]} />
              <meshStandardMaterial color="#E8D5A3" metalness={0.9} roughness={0.15} />
            </mesh>
            {/* Spoke 1 */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <boxGeometry args={[1.25, 0.04, 0.06]} />
              <meshStandardMaterial color="#E8D5A3" metalness={0.9} roughness={0.15} />
            </mesh>
            {/* Spoke 2 */}
            <mesh rotation={[Math.PI / 2, 0, Math.PI / 2]}>
              <boxGeometry args={[1.25, 0.04, 0.06]} />
              <meshStandardMaterial color="#E8D5A3" metalness={0.9} roughness={0.15} />
            </mesh>
          </group>

          {/* Ruby Pivots / Jewel Bearings */}
          <mesh position={[0.4, 0.14, -0.4]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.05, 12]} />
            <meshStandardMaterial color="#E0115F" metalness={0.4} roughness={0.05} emissive="#E0115F" emissiveIntensity={0.6} />
          </mesh>
          <mesh position={[-0.4, 0.12, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.05, 12]} />
            <meshStandardMaterial color="#E0115F" metalness={0.4} roughness={0.05} emissive="#E0115F" emissiveIntensity={0.6} />
          </mesh>
          <mesh position={[0, 0.11, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.14, 0.14, 0.05, 12]} />
            <meshStandardMaterial color="#E0115F" metalness={0.4} roughness={0.05} emissive="#E0115F" emissiveIntensity={0.7} />
          </mesh>
        </group>
      )}

      {/* Hour markers / Indices */}
      {markers.map((marker, idx) => (
        <group key={idx} position={[marker.x, 0.24 + explodeProgress * 0.8, marker.z]} rotation={[0, -marker.angle, 0]}>
          {indexStyle === 'baton' || indexStyle === 'skeleton' ? (
            <mesh>
              <boxGeometry args={[0.08, 0.04, 0.25]} />
              <meshStandardMaterial 
                color={idx % 3 === 0 ? '#E8D5A3' : '#8C8C8C'} 
                emissive={idx % 3 === 0 ? '#B8A16A' : '#000000'}
                emissiveIntensity={0.2}
                metalness={0.9}
              />
            </mesh>
          ) : (
            // Small placeholder indicator dot for text indices
            <mesh position={[0, 0, 0.1]}>
              <sphereGeometry args={[0.04, 8, 8]} />
              <meshStandardMaterial color="#E8D5A3" />
            </mesh>
          )}
        </group>
      ))}

      {/* 5. WATCH HANDS */}
      <group position={[0, 0.25 + explodeProgress * 1.2, 0]}>
        {/* Hour Hand */}
        <group ref={hourHandRef}>
          <mesh position={[0, 0, 0.45]}>
            <boxGeometry args={[0.08, 0.02, 0.9]} />
            <meshStandardMaterial color="#E8D5A3" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>

        {/* Minute Hand */}
        <group ref={minuteHandRef}>
          <mesh position={[0, 0.01, 0.65]}>
            <boxGeometry args={[0.06, 0.02, 1.3]} />
            <meshStandardMaterial color="#E8D5A3" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>

        {/* Second Hand (Ticking / Sweeping) */}
        <group ref={secondHandRef}>
          <mesh position={[0, 0.02, 0.75]}>
            <boxGeometry args={[0.02, 0.01, 1.5]} />
            <meshStandardMaterial color="#B8A16A" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>

        {/* Center Pin */}
        <mesh position={[0, 0.03, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.08, 16]} />
          <meshStandardMaterial color="#E8D5A3" metalness={0.9} />
        </mesh>
      </group>

      {/* 6. SAPPHIRE CRYSTAL GLASS */}
      <mesh position={[0, 0.32 + explodeProgress * 2.0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.82, 1.82, 0.02, 64]} />
        <meshPhysicalMaterial 
          color="#E6F2FF" 
          transmission={0.98} 
          roughness={0.01} 
          ior={1.77} // sapphire IOR
          transparent 
          opacity={0.3} 
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

interface WatchCanvasProps {
  onHoverStateChange?: (hovered: boolean) => void;
  explodeProgress?: number;
}

export default function WatchCanvas({ onHoverStateChange }: WatchCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePointerOver = () => {
    if (onHoverStateChange) onHoverStateChange(true);
  };

  const handlePointerOut = () => {
    if (onHoverStateChange) onHoverStateChange(false);
  };

  return (
    <div 
      ref={containerRef}
      className="w-full h-full min-h-[400px] flex items-center justify-center relative cursor-grab active:cursor-grabbing"
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <Canvas 
        camera={{ position: [0, 4, 6], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.6} />
        {/* Cinematic volumetric lighting spots */}
        <pointLight position={[5, 10, 5]} intensity={1.5} color="#E8D5A3" castShadow />
        <pointLight position={[-5, -10, -5]} intensity={0.5} color="#ffffff" />
        <directionalLight position={[0, 8, 2]} intensity={1.0} color="#ffffff" />
        
        <Center>
          <WatchModel />
        </Center>
        
        <OrbitControls 
          enableZoom={true} 
          minDistance={3} 
          maxDistance={10}
          enablePan={false}
          maxPolarAngle={Math.PI / 2 - 0.05} // prevent going below horizon
        />
      </Canvas>
    </div>
  );
}
