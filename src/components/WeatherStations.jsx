// src/components/WeatherStations.jsx
import React, { useState, useEffect } from 'react';

const WeatherStations = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWeatherStations();
  }, []);

  const loadWeatherStations = async () => {
    try {
      // Simulated weather stations data for MVP
      // In a real app, you'd fetch this from your API or external service
      const mockStations = [
        {
          id: 1,
          name: 'Shadnagar Agricultural Station',
          type: 'Primary',
          district: 'Mahabubnagar',
          status: 'Active',
          latitude: 17.0993,
          longitude: 78.2048,
          parameters: ['Temperature', 'Humidity', 'Rainfall', 'Wind Speed']
        },
        {
          id: 2,
          name: 'Hyderabad Weather Center',
          type: 'Urban',
          district: 'Hyderabad',
          status: 'Active',
          latitude: 17.3850,
          longitude: 78.4867,
          parameters: ['Temperature', 'Humidity', 'Air Quality']
        },
        {
          id: 3,
          name: 'Rangareddy Rural Station',
          type: 'Rural',
          district: 'Rangareddy',
          status: 'Active',
          latitude: 17.2403,
          longitude: 78.4294,
          parameters: ['Soil Temperature', 'Moisture', 'Rainfall']
        }
      ];

      setTimeout(() => {
        setStations(mockStations);
        setLoading(false);
      }, 1000);

    } catch (error) {
      console.error('Error loading weather stations:', error);
      setLoading(false);
    }
  };

  const refreshStations = () => {
    setLoading(true);
    loadWeatherStations();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading weather stations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="space-y-6">
        {/* Controls */}
        <div className="flex flex-wrap gap-4">
          <button
            onClick={refreshStations}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            🔄 Refresh Stations
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            📍 Find Nearest
          </button>
          <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
            🗺️ Show All
          </button>
        </div>

        {/* Map Placeholder */}
        <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center border-2 border-dashed border-gray-300">
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-2">🗺️</div>
            <p>Weather Stations Map</p>
            <p className="text-sm">(Google Maps integration would go here)</p>
          </div>
        </div>

        {/* Stations List */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Weather Stations Near You</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stations.map((station) => (
              <div
                key={station.id}
                className="bg-gray-50 rounded-lg p-4 border-l-4 border-green-500 hover:shadow-md transition-shadow cursor-pointer"
              >
                <h4 className="font-semibold text-green-700 mb-2">{station.name}</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><strong>Type:</strong> {station.type}</p>
                  <p><strong>District:</strong> {station.district}</p>
                  <p>
                    <strong>Status:</strong> 
                    <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                      station.status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {station.status}
                    </span>
                  </p>
                  <div>
                    <strong>Parameters:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {station.parameters.map((param, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                        >
                          {param}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherStations;