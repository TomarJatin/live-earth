import { useRef, useState } from "react";
import { Vector3, Sprite } from "three";
// import { Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface LocationMarkerProps {
  lat: number;
  lng: number;
  label?: string;
}

export default function LocationMarker({ lat, lng, label }: LocationMarkerProps) {
  const markerRef = useRef<Sprite>(null);
  const { camera } = useThree();
  const [scale, setScale] = useState(1);
  console.log(label)

  // Create texture loader and load image
  const texture = new THREE.TextureLoader().load('/home-pin.png');
  
  // Convert latitude and longitude to 3D coordinates
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  
  // Calculate position on sphere (radius is 2 to match Earth's radius)
  const x = -(2 * Math.sin(phi) * Math.cos(theta));
  const y = 2 * Math.cos(phi);
  const z = 2 * Math.sin(phi) * Math.sin(theta);

  // Simplified useFrame - removed pulsing animation
  useFrame(() => {
    if (markerRef.current) {
      const distance = camera.position.distanceTo(new Vector3(x, y, z));
      const newScale = Math.max(0.02, Math.min(0.08, distance * 0.02));
      setScale(newScale);
    }
  });

  return (
    <group position={[x, y, z]}>
      {/* Replace previous meshes with a single sprite */}
      <sprite ref={markerRef} scale={[scale * 2, scale * 2.5, 1]}>
        <spriteMaterial
          map={texture}
          transparent
          sizeAttenuation={true}
          depthTest={true}
          depthWrite={false}
          alphaTest={0.5}
        />
      </sprite>

      {/* {label && (
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
      )} */}
    </group>
  );
}