import { useState } from 'react';

interface LocationSearchProps {
  onSearch: (location: { lat: number; lng: number }) => void;
}

export default function LocationSearch({ onSearch }: LocationSearchProps) {
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    
    if (!isNaN(latitude) && !isNaN(longitude)) {
      if (latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180) {
        onSearch({ lat: latitude, lng: longitude });
      } else {
        alert('Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white/90 p-3 rounded-lg shadow-lg">
      <div className="flex flex-col gap-2">
        <input
          type="text"
          placeholder="Latitude (-90 to 90)"
          value={lat}
          onChange={(e) => setLat(e.target.value)}
          className="px-2 py-1 border rounded text-sm"
        />
        <input
          type="text"
          placeholder="Longitude (-180 to 180)"
          value={lng}
          onChange={(e) => setLng(e.target.value)}
          className="px-2 py-1 border rounded text-sm"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-1 rounded text-sm hover:bg-blue-600"
        >
          Search
        </button>
      </div>
    </form>
  );
}