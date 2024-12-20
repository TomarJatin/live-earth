import { useRef, useState } from "react";
import { Mesh, Vector3, MeshBasicMaterial } from "three";
import { Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";

interface SearchMarkerProps {
  lat: number;
  lng: number;
  label?: string;
}

export default function SearchMarker({ lat, lng, label }: SearchMarkerProps) {
  const markerRef = useRef<Mesh>(null);
  const pulsingRingRef = useRef<Mesh>(null);
  const { camera } = useThree();
  const [scale, setScale] = useState(1);

  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  
  const x = -(2 * Math.sin(phi) * Math.cos(theta));
  const y = 2 * Math.cos(phi);
  const z = 2 * Math.sin(phi) * Math.sin(theta);

  useFrame(({ clock }) => {
    if (markerRef.current) {
      const distance = camera.position.distanceTo(new Vector3(x, y, z));
      const newScale = Math.max(0.02, Math.min(0.08, distance * 0.02));
      setScale(newScale);
    }

    if (pulsingRingRef.current?.material) {
      const material = pulsingRingRef.current.material as MeshBasicMaterial;
      material.opacity = 0.3 + Math.sin(clock.getElapsedTime() * 2) * 0.1;
    }
  });

  return (
    <group position={[x, y, z]}>
      {/* Outer ring */}
      <mesh rotation-x={Math.PI / 2} scale={scale * 1.2}>
        <ringGeometry args={[0.5, 0.7, 32]} />
        <meshBasicMaterial color="#4444FF" transparent opacity={0.5} />
      </mesh>

      {/* Inner dot */}
      <mesh ref={markerRef} scale={scale * 0.4}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color="#0000FF" />
      </mesh>

      {/* Pulsing ring */}
      <mesh 
        ref={pulsingRingRef} 
        rotation-x={Math.PI / 2} 
        scale={scale * 1.5}
      >
        <ringGeometry args={[0.8, 0.9, 32]} />
        <meshBasicMaterial color="#4444FF" transparent opacity={0.3} />
      </mesh>

      {label && (
        <Html
          position={[0, scale * 2, 0]}
          center
          style={{
            transition: 'all 0.2s',
            opacity: scale > 0.05 ? 1 : 0,
          }}
        >
          <div className="bg-white/90 text-black/70 px-2 py-1 rounded-md text-sm shadow-md whitespace-nowrap">
            <div className="font-semibold">{label}</div>
            <div className="text-xs text-gray-600">
              {lat.toFixed(4)}°, {lng.toFixed(4)}°
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}