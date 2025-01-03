"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { useTexture, OrbitControls, Sphere } from "@react-three/drei";
import { 
  // useThree,
 useFrame } from "@react-three/fiber";
import { Mesh, DoubleSide, 
  // Vector3

 } from "three";
import LocationMarker from "./LocationMarker";
import SearchMarker from "./SearchMarker";

// Add this interface for our location data
interface Location {
  lat: number;
  lng: number;
  label: string;
}

// Add this constant array of predefined locations
const PREDEFINED_LOCATIONS: Location[] = [
  { lat: 40.7128, lng: -74.0060, label: "New York, USA" },
  { lat: -33.8688, lng: 151.2093, label: "Sydney, Australia" },
  { lat: 35.6762, lng: 139.6503, label: "Tokyo, Japan" },
  { lat: 51.5074, lng: -0.1278, label: "London, UK" },
  { lat: -1.2921, lng: 36.8219, label: "Nairobi, Kenya" },
  { lat: -22.9068, lng: -43.1729, label: "Rio de Janeiro, Brazil" },
  { lat: 55.7558, lng: 37.6173, label: "Moscow, Russia" },
  { lat: 31.2304, lng: 121.4737, label: "Shanghai, China" },
  { lat: -34.6037, lng: -58.3816, label: "Buenos Aires, Argentina" },
  { lat: 28.6139, lng: 77.2090, label: "New Delhi, India" },
  { lat: 64.1265, lng: -21.8174, label: "Reykjavik, Iceland" },
  { lat: 1.3521, lng: 103.8198, label: "Singapore" }
];

interface EarthProps {
  onError: (error: string | null) => void;
  // searchLocation: { lat: number; lng: number } | null;
}

export default function Earth({ onError, 
  // searchLocation
 }: EarthProps) {
  // Add state for tracking user interaction
  const [isInteracting, setIsInteracting] = useState(false);
  const earthRef = useRef<Mesh>(null);
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);
  // const { camera } = useThree();
  
  // Load all textures
  const [worldMap] = useTexture([
    '/textures/world-map.png',
  ]);

  const rotationSpeed = 0.002;
  
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

  // useEffect(() => {
  //   if (searchLocation && earthRef.current) {
  //     const phi = (90 - searchLocation.lat) * (Math.PI / 180);
  //     const theta = (searchLocation.lng + 180) * (Math.PI / 180);
      
  //     const x = -(5 * Math.sin(phi) * Math.cos(theta));
  //     const y = 5 * Math.cos(phi);
  //     const z = 5 * Math.sin(phi) * Math.sin(theta);

  //     // Animate camera position
  //     const duration = 1000;
  //     const start = Date.now();
  //     const startPos = camera.position.clone();
  //     const targetPos = new Vector3(x, y, z);

  //     function animate() {
  //       const elapsed = Date.now() - start;
  //       const progress = Math.min(elapsed / duration, 1);
        
  //       // Ease function
  //       const eased = progress < 0.5
  //         ? 2 * progress * progress
  //         : -1 + (4 - 2 * progress) * progress;

  //       camera.position.lerpVectors(startPos, targetPos, eased);
  //       camera.lookAt(0, 0, 0);

  //       if (progress < 1) {
  //         requestAnimationFrame(animate);
  //       }
  //     }

  //     animate();
  //   }
  // }, [searchLocation]);

  useFrame(() => {
    if (earthRef.current && !isInteracting) {  // Only rotate when not interacting
      earthRef.current.rotation.y += rotationSpeed;
      
      // Update markers rotation to counter Earth's rotation
      const markerGroup = earthRef.current.children[1];
      if (markerGroup) {
        markerGroup.rotation.y = -earthRef.current.rotation.y;
      }
    }
  });

  // Memoize both location marker and search markers
  const memoizedMarkers = useMemo(() => {
    const markers = PREDEFINED_LOCATIONS.map((location, index) => (
      <SearchMarker 
        key={index}
        lat={location.lat}
        lng={location.lng}
        label={location.label}
      />
    ));

    // Add user location marker if available
    if (userLocation) {
      markers.push(
        <LocationMarker 
          key="user-location"
          lat={userLocation.lat} 
          lng={userLocation.lng}
          label="Your Location"
        />
      );
    }

    return markers;
  }, [userLocation]); // Add userLocation as dependency since it can change

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
        onStart={() => setIsInteracting(true)}
        onEnd={() => setIsInteracting(false)}
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

            // Function to create line pattern
            float createLines(vec2 p, float size) {
              // Create diagonal lines
              float lines = sin(p.x * size + p.y * size) * 0.5 + 0.5;
              return smoothstep(0.45, 0.55, lines);
            }

            void main() {
              vec4 texColor = texture2D(map, vUv);
              float brightness = (texColor.r + texColor.g + texColor.b) / 3.0;
              
              // Make dark areas completely transparent and light areas slightly visible
              float alpha = smoothstep(0.1, 0.15, brightness) * 1.6;
              
              // Define the target color in RGB
              vec3 targetColor = vec3(0.5, 0.5, 0.5);
              
              // Create line pattern with increased frequency
              float linePattern = createLines(vUv * 5.0, 500.0);
              
              // Apply lines only to visible areas
              vec3 finalColor = targetColor;
              float finalAlpha = clamp(alpha * (linePattern * 0.5 + 0.5), 0.1, 1.0);
              
              gl_FragColor = vec4(finalColor, finalAlpha);
            }
          `}
        />
        
        <group>
          {/* Replace both markers with the single memoized array */}
          {memoizedMarkers}
        </group>
      </Sphere>
    </>
  );
}