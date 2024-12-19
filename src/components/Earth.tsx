"use client";

import { useRef, useState, useEffect } from "react";
import { useTexture, OrbitControls, Sphere } from "@react-three/drei";
import { Mesh } from "three";
import LocationMarker from "./LocationMarker";

interface EarthProps {
  onError: (error: string | null) => void;
}

export default function Earth({ onError }: EarthProps) {
  const earthRef = useRef<Mesh>(null);
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);
//   const [retryCount, setRetryCount] = useState(0);
//   const MAX_RETRIES = 3;
  
  // Load all textures
  const [colorMap, normalMap, specularMap] = useTexture([
    '/textures/earth-day.jpg',
    '/textures/earth-normal.jpg',
    '/textures/earth-specular.jpg'
  ]);

  useEffect(() => {
    const fallbackToIPLocation = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        if (data.latitude && data.longitude) {
          setUserLocation({
            lat: data.latitude,
            lng: data.longitude
          });
          onError(null);
        } else {
          throw new Error('Invalid location data');
        }
      } catch (error) {
        console.error('IP Geolocation failed:', error);
        setUserLocation({
          lat: 51.5074,
          lng: -0.1278
        });
        onError('Using default location');
      }
    };

    // Get user's geolocation
    if ("geolocation" in navigator) {
      const options = {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 30000
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          onError(null);
        },
        (error) => {
          console.error("Error getting location:", error);
          fallbackToIPLocation();
        },
        options
      );
    } else {
      fallbackToIPLocation();
    }
  }, [onError]);

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

      <ambientLight intensity={1} />
      {/* <directionalLight 
        intensity={2} 
        position={[0, 0, 5]} 
        castShadow
      /> */}
      <hemisphereLight
        intensity={0.5}
        color="#ffffff"
        groundColor="#000000"
      />

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