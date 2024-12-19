"use client";

import { useRef, useState, useEffect } from "react";
import { useTexture, OrbitControls, Sphere } from "@react-three/drei";
import { Mesh, DoubleSide } from "three";
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
  const [worldMap] = useTexture([
    '/textures/world-map.png',
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

      {/* <ambientLight intensity={1.5} /> */}
      {/* <directionalLight 
        intensity={2} 
        position={[0, 0, 5]} 
        castShadow
      /> */}
      {/* <hemisphereLight
        intensity={0.8}
        color="#ffffff"
        groundColor="#000000"
      /> */}

      <Sphere ref={earthRef} args={[2, 64, 64]}>
        <shaderMaterial
          transparent={true}
          side={DoubleSide}
          depthWrite={false}
          uniforms={{
            map: { value: worldMap }
          }}
          vertexShader={`
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            uniform sampler2D map;
            varying vec2 vUv;

            // Function to create hexagonal pattern
            float createHex(vec2 p, float size) {
              p *= size;
              
              // Hexagonal tiling
              vec2 h = vec2(1.0, sqrt(3.0));
              vec2 a = mod(p, h) - h*0.5;
              vec2 b = mod(p + h*0.5, h) - h*0.5;
              
              // Calculate hexagon
              vec2 gv = length(a) < length(b) ? a : b;
              float hex = length(gv);
              
              return smoothstep(0.3, 0.2, hex);
            }

            void main() {
              vec4 texColor = texture2D(map, vUv);
              float brightness = (texColor.r + texColor.g + texColor.b) / 3.0;
              
              // Make dark areas completely transparent and light areas slightly visible
              float alpha = smoothstep(0.1, 0.15, brightness) * 0.3;
              
              // Define the target color (#2cff05) in RGB
              vec3 targetColor = vec3(0.172, 1.0, 0.019);
              
              // Create hexagonal pattern with much smaller hexagons
              float hexPattern = createHex(vUv * 2.0, 200.0);
              
              // Apply hexagons only to visible areas
              vec3 finalColor = targetColor;
              float finalAlpha = alpha * (hexPattern * 0.5 + 0.5);
              
              gl_FragColor = vec4(finalColor, finalAlpha);
            }
          `}
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