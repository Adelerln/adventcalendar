"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Text } from "@react-three/drei";
import { useRef, useState } from "react";
import * as THREE from "three";
import RedSilkEnvelope from "./RedSilkEnvelope";

type DayBox = {
  day: number;
  isUnlocked: boolean;
  isToday: boolean;
  photo?: string | null;
  message?: string | null;
  drawing?: string | null;
  music?: string | null;
};

type ChristmasTree3DProps = {
  days: DayBox[];
  onDayClick: (day: number) => void;
};

// Distribution des jours par niveau (base = niveau 0)
const LEVELS = [
  { days: [1, 2, 3, 4, 5, 6], radius: 3.2, height: 0 },
  { days: [7, 8, 9, 10, 11], radius: 2.7, height: 1.2 },
  { days: [12, 13, 14, 15, 16], radius: 2.2, height: 2.4 },
  { days: [17, 18, 19, 20], radius: 1.7, height: 3.6 },
  { days: [21, 22, 23], radius: 1.2, height: 4.8 },
  { days: [24], radius: 0.7, height: 6.0 },
  { days: [25], radius: 0.4, height: 7.2 },
];

function WoodenTier({ radius, height }: { radius: number; height: number }) {
  return (
    <group position={[0, height, 0]}>
      {/* Plateau circulaire en bois */}
      <mesh rotation={[0, 0, 0]}>
        <cylinderGeometry args={[radius, radius, 0.15, 32]} />
        <meshStandardMaterial color="#c9a171" roughness={0.7} metalness={0.1} />
      </mesh>
      {/* Bordure */}
      <mesh position={[0, -0.08, 0]}>
        <torusGeometry args={[radius, 0.05, 16, 32]} />
        <meshStandardMaterial color="#a07850" roughness={0.6} />
      </mesh>
    </group>
  );
}

function House({ position, day, isUnlocked, onClick }: { position: [number, number, number]; day: number; isUnlocked: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <group position={position}>
      {/* Corps de la maison */}
      <mesh
        onClick={isUnlocked ? onClick : undefined}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.1 : 1}
        position={[0, 0, 0]}
      >
        <boxGeometry args={[0.35, 0.4, 0.35]} />
        <meshStandardMaterial color="#d8b48e" roughness={0.5} />
      </mesh>

      {/* Toit blanc */}
      <mesh position={[0, 0.3, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[0.28, 0.25, 4]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>

      {/* Plaque blanche avec numéro */}
      <mesh position={[0, 0, 0.18]}>
        <planeGeometry args={[0.22, 0.22]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      {/* Numéro avec Text de drei */}
      <Text
        position={[0, 0, 0.19]}
        fontSize={0.12}
        color="#000000"
        anchorX="center"
        anchorY="middle"
      >
        {day}
      </Text>
    </group>
  );
}

function Pine({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Sapin vert foncé */}
      <mesh position={[0, 0.1, 0]}>
        <coneGeometry args={[0.12, 0.35, 8]} />
        <meshStandardMaterial color="#0d5c2b" roughness={0.8} />
      </mesh>
      
      {/* Neige sur le sapin (petit cône blanc) */}
      <mesh position={[0, 0.25, 0]}>
        <coneGeometry args={[0.08, 0.12, 8]} />
        <meshStandardMaterial color="#ffffff" roughness={0.2} />
      </mesh>
      
      {/* Tronc */}
      <mesh position={[0, -0.12, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.1, 8]} />
        <meshStandardMaterial color="#5a3723" />
      </mesh>
    </group>
  );
}

function TreeScene({ days, onHouseClick }: { days: DayBox[]; onHouseClick: (day: number) => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const getDayData = (day: number) => days.find((d) => d.day === day) || { day, isUnlocked: false, isToday: false };

  // Rotation automatique désactivée (tu peux drag manuellement)
  // useFrame((state) => {
  //   if (groupRef.current) {
  //     groupRef.current.rotation.y += 0.002;
  //   }
  // });

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 10, 5]} intensity={0.9} castShadow />
      <pointLight position={[-5, 5, -5]} intensity={0.4} />
      <spotLight position={[0, 12, 0]} angle={0.5} intensity={0.5} penumbra={0.5} />

      {/* Étoile dorée au sommet */}
      <mesh position={[0, 8, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#ffd700" emissive="#ffaa00" emissiveIntensity={0.5} metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Tronc */}
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.2, 0.25, 1, 16]} />
        <meshStandardMaterial color="#6b4423" roughness={0.9} />
      </mesh>

      {/* Niveaux */}
      <group ref={groupRef}>
        {LEVELS.map((level, idx) => {
          const numHouses = level.days.length;
          const angleStep = (Math.PI * 2) / numHouses;

          return (
            <group key={idx}>
              <WoodenTier radius={level.radius} height={level.height} />

              {level.days.map((day, i) => {
                const angle = i * angleStep;
                const x = Math.cos(angle) * (level.radius - 0.25);
                const z = Math.sin(angle) * (level.radius - 0.25);
                const dayData = getDayData(day);

                return (
                  <group key={day}>
                    <House
                      position={[x, level.height + 0.3, z]}
                      day={day}
                      isUnlocked={dayData.isUnlocked || dayData.isToday}
                      onClick={() => onHouseClick(day)}
                    />
                    {/* Sapin à côté (plus proche) */}
                    <Pine
                      position={[
                        Math.cos(angle + angleStep / 2) * (level.radius - 0.35),
                        level.height + 0.15,
                        Math.sin(angle + angleStep / 2) * (level.radius - 0.35),
                      ]}
                    />
                  </group>
                );
              })}
            </group>
          );
        })}
      </group>
    </>
  );
}

export default function ChristmasTree3D({ days, onDayClick }: ChristmasTree3DProps) {
  const [selectedContent, setSelectedContent] = useState<DayBox | null>(null);
  const [envelopeOpen, setEnvelopeOpen] = useState(false);

  const handleHouseClick = (day: number) => {
    const content = days.find((d) => d.day === day);
    if (content) {
      setSelectedContent(content);
      setTimeout(() => setEnvelopeOpen(true), 400);
      onDayClick(day);
    }
  };

  const handleEnvelopeClose = () => {
    setEnvelopeOpen(false);
    setTimeout(() => setSelectedContent(null), 300);
  };

  return (
    <div className="relative w-full h-[800px] bg-white flex items-center justify-center">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 5, 9]} fov={50} />
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={7}
          maxDistance={14}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.2}
          enableRotate={true}
          autoRotate={false}
        />
        <TreeScene days={days} onHouseClick={handleHouseClick} />
      </Canvas>

      <RedSilkEnvelope
        isOpen={envelopeOpen}
        onOpen={() => {}}
        onClose={handleEnvelopeClose}
        content={
          selectedContent
            ? {
                day: selectedContent.day,
                photo: selectedContent.photo || null,
                message: selectedContent.message || null,
                drawing: selectedContent.drawing || null,
                music: selectedContent.music || null,
                musicTitle: null,
              }
            : null
        }
      />
    </div>
  );
}
