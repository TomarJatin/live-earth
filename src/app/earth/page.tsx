"use client";

import { View } from "@react-three/drei";
import Earth from "@/components/Earth";
import { useState, useEffect } from "react";

export default function EarthPage() {
  const [locationPermission, setLocationPermission] = useState<string>("prompt");
  const [locationError, setLocationError] = useState<string | null>(null);

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
    <div className="h-screen w-full relative">
      <View className="h-full w-full">
        <Earth onError={setLocationError} />
      </View>

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