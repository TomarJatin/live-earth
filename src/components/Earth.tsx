"use client";

import { useRef, useState, useEffect } from "react";
// import { useFrame } from "@react-three/fiber";
import { useTexture, OrbitControls, Sphere } from "@react-three/drei";
import { Mesh } from "three";
import LocationMarker from "./LocationMarker";

export default function Earth() {
  const earthRef = useRef<Mesh>(null);
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);
  
  // Load all textures
  const [colorMap, normalMap, specularMap] = useTexture([
    '/textures/earth-day.jpg',
    '/textures/earth-normal.jpg',
    '/textures/earth-specular.jpg'
  ]);

  useEffect(() => {
    // Get user's geolocation
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  return (
    <>
      <OrbitControls 
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        zoomSpeed={0.6}
        panSpeed={0.5}
        rotateSpeed={0.4}
        minDistance={2.5}
        maxDistance={10}
      />

      <ambientLight intensity={0.1} />
      <directionalLight intensity={3.5} position={[1, 0, 2]} />

      <Sphere ref={earthRef} args={[2, 64, 64]}>
        <meshPhongMaterial
          map={colorMap}
          normalMap={normalMap}
          specularMap={specularMap}
          shininess={5}
        />
      </Sphere>

      {userLocation && (
        <LocationMarker 
          lat={userLocation.lat} 
          lng={userLocation.lng}
          label={`Your Location (${userLocation.lat.toFixed(2)}°, ${userLocation.lng.toFixed(2)}°)`}
        />
      )}
    </>
  );
}