"use client";

import { useRef, useState, useEffect } from "react";
import { useTexture, OrbitControls, Sphere } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { Mesh, DoubleSide, Vector3 } from "three";
import LocationMarker from "./LocationMarker";
import SearchMarker from "./SearchMarker";

interface EarthProps {
  onError: (error: string | null) => void;
  searchLocation: { lat: number; lng: number } | null;
}

export default function Earth({ onError, searchLocation }: EarthProps) {
  const earthRef = useRef<Mesh>(null);
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);
  const { camera } = useThree();
  
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

  useEffect(() => {
    if (searchLocation && earthRef.current) {
      const phi = (90 - searchLocation.lat) * (Math.PI / 180);
      const theta = (searchLocation.lng + 180) * (Math.PI / 180);
      
      const x = -(5 * Math.sin(phi) * Math.cos(theta));
      const y = 5 * Math.cos(phi);
      const z = 5 * Math.sin(phi) * Math.sin(theta);

      // Animate camera position
      const duration = 1000;
      const start = Date.now();
      const startPos = camera.position.clone();
      const targetPos = new Vector3(x, y, z);

      function animate() {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease function
        const eased = progress < 0.5
          ? 2 * progress * progress
          : -1 + (4 - 2 * progress) * progress;

        camera.position.lerpVectors(startPos, targetPos, eased);
        camera.lookAt(0, 0, 0);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      }

      animate();
    }
  }, [searchLocation]);

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
              float alpha = smoothstep(0.1, 0.15, brightness) * 1.3;
              
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
          label="Your Location"
        />
      )}

      {searchLocation && (
        <SearchMarker 
          lat={searchLocation.lat} 
          lng={searchLocation.lng}
          label="Searched Location"
        />
      )}
    </>
  );
}