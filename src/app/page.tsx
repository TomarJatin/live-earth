"use client";

import { View } from "@react-three/drei";
import Earth from "@/components/Earth";
import { useState, useEffect } from "react";
// import LocationSearch from '@/components/LocationSearch';

export default function Page() {
  const [locationPermission, setLocationPermission] = useState<string>("prompt");
  const [locationError, setLocationError] = useState<string | null>(null);
  // const [searchLocation, setSearchLocation] = useState<{lat: number; lng: number} | null>(null);

  useEffect(() => {
    // Check location permission status
    navigator.permissions
      ?.query({ name: "geolocation" })
      .then((permissionStatus) => {
        setLocationPermission(permissionStatus.state);
        
        permissionStatus.onchange = () => {
          setLocationPermission(permissionStatus.state);
        };
      })
      .catch(error => {
        console.error("Permission query error:", error);
      });
  }, []);

  return (
    <div className="h-screen w-full relative text-black">
      {/* Add space background */}
      <div 
        className="absolute inset-0 bg-black"
        style={{
          background: 'radial-gradient(circle at center, #0a192f 0%, #000000 100%)',
        }}
      >
        {/* First star layer - slower moving */}
        <div className="stars-container absolute inset-0" 
          style={{
            background: 'transparent url(/textures/stars.png) repeat top center',
            zIndex: 0,
            animation: 'move-stars 400s linear infinite',
            opacity: 0.6
          }}
        />
        {/* Second star layer - faster moving for parallax effect */}
        <div className="stars-container absolute inset-0" 
          style={{
            background: 'transparent url(/textures/stars.png) repeat top center',
            zIndex: 0,
            animation: 'move-stars 200s linear infinite',
            opacity: 0.3,
            transform: 'scale(0.8)'
          }}
        />
      </div>

      <View className="h-full w-full relative z-10">
        <Earth onError={setLocationError}
        //  searchLocation={searchLocation} 
         />
      </View>

      {/* Add Search Component */}
      {/* <div className="absolute top-4 right-4 z-10">
        <LocationSearch onSearch={setSearchLocation} />
      </div> */}

      {/* Location Permission Messages */}
      {locationPermission === "prompt" && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/90 p-4 rounded-lg shadow-lg">
          <p className="text-sm text-gray-700">
            Please allow location access to see your position on the globe
          </p>
        </div>
      )}
      
      {locationPermission === "denied" && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-50 p-4 rounded-lg shadow-lg">
          <p className="text-sm text-red-700">
            Location access is denied. Please enable it in your browser settings to see your position.
          </p>
        </div>
      )}

      {/* Error Message */}
      {locationError && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-yellow-50 p-4 rounded-lg shadow-lg">
          <p className="text-sm text-yellow-700">
            {locationError} - Showing default location
          </p>
        </div>
      )}
    </div>
  );
}