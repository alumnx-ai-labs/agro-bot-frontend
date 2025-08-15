// src/components/WeatherStations.jsx
import React, { useState, useEffect } from 'react';

const WeatherStations = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStation, setSelectedStation] = useState(null);
  const [mapView, setMapView] = useState('hybrid');

  useEffect(() => {
    loadWeatherStations();
  }, []);

  const loadWeatherStations = async () => {
    try {
      const mockStations = [
        {
          id: 1,
          name: 'Shadnagar Agricultural Station',
          type: 'Primary',
          district: 'Mahabubnagar',
          status: 'Active',
          latitude: 17.0993,
          longitude: 78.2048,
          parameters: ['Temperature', 'Humidity', 'Rainfall', 'Wind Speed'],
          lastUpdated: '2024-01-15 14:30',
          currentTemp: '28°C',
          humidity: '65%',
          rainfall: '12mm',
          connectivity: 'Online'
        },
        {
          id: 2,
          name: 'Hyderabad Weather Center',
          type: 'Urban',
          district: 'Hyderabad',
          status: 'Active',
          latitude: 17.3850,
          longitude: 78.4867,
          parameters: ['Temperature', 'Humidity', 'Air Quality'],
          lastUpdated: '2024-01-15 14:25',
          currentTemp: '31°C',
          humidity: '58%',
          airQuality: 'Moderate',
          connectivity: 'Online'
        },
        {
          id: 3,
          name: 'Rangareddy Rural Station',
          type: 'Rural',
          district: 'Rangareddy',
          status: 'Active',
          latitude: 17.2403,
          longitude: 78.4294,
          parameters: ['Soil Temperature', 'Moisture', 'Rainfall'],
          lastUpdated: '2024-01-15 14:20',
          soilTemp: '26°C',
          moisture: '45%',
          rainfall: '8mm',
          connectivity: 'Online'
        },
        {
          id: 4,
          name: 'Warangal Agricultural Hub',
          type: 'Research',
          district: 'Warangal',
          status: 'Active',
          latitude: 17.9689,
          longitude: 79.5941,
          parameters: ['Temperature', 'Humidity', 'UV Index', 'Wind Speed'],
          lastUpdated: '2024-01-15 14:35',
          currentTemp: '29°C',
          humidity: '62%',
          uvIndex: '7 (High)',
          connectivity: 'Online'
        },
        {
          id: 5,
          name: 'Nizamabad Cotton Station',
          type: 'Specialized',
          district: 'Nizamabad',
          status: 'Maintenance',
          latitude: 18.6725,
          longitude: 78.0941,
          parameters: ['Temperature', 'Humidity', 'Leaf Wetness'],
          lastUpdated: '2024-01-15 10:15',
          currentTemp: 'N/A',
          humidity: 'N/A',
          connectivity: 'Offline'
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
      <div style={{
        background: 'white',
        borderRadius: '15px',
        padding: '40px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '5px solid #f3f3f3',
          borderTop: '5px solid #ff6b35',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px'
        }}></div>
        <p style={{ fontSize: '1.2rem', fontWeight: '600', color: '#333', marginBottom: '10px' }}>
          Loading weather stations network...
        </p>
        <p style={{ color: '#666', fontSize: '0.9rem' }}>
          Connecting to agricultural weather monitoring system
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      {/* Header Section */}
      <div style={{
        background: 'white',
        borderRadius: '15px',
        padding: '25px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div>
            <h2 style={{
              fontSize: '1.8rem',
              fontWeight: 'bold',
              color: '#333',
              margin: '0 0 10px 0'
            }}>
              🌦️ Agricultural Weather Network
            </h2>
            <p style={{ color: '#666', margin: 0 }}>
              Real-time weather monitoring across farming regions
            </p>
          </div>
          
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '15px'
          }}>
            <button
              onClick={refreshStations}
              style={{
                padding: '12px 20px',
                background: '#ff6b35',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                boxShadow: '0 5px 15px rgba(255,107,53,0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#e55a2b';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#ff6b35';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              🔄 Refresh Data
            </button>
            <button style={{
              padding: '12px 20px',
              background: '#4a90e2',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              boxShadow: '0 5px 15px rgba(74,144,226,0.3)'
            }}>
              📍 Find Nearest
            </button>
            <select 
              value={mapView} 
              onChange={(e) => setMapView(e.target.value)}
              style={{
                padding: '12px 15px',
                border: '2px solid #ddd',
                borderRadius: '8px',
                fontSize: '1rem',
                cursor: 'pointer',
                background: 'white'
              }}
            >
              <option value="hybrid">🛰️ Satellite</option>
              <option value="roadmap">🗺️ Roadmap</option>
              <option value="terrain">🏔️ Terrain</option>
            </select>
          </div>

          {/* Stats Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '15px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #d4edda, #c3e6cb)',
              padding: '20px',
              borderRadius: '10px',
              textAlign: 'center',
              border: '2px solid #b6d7a8'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#155724' }}>
                {stations.filter(s => s.status === 'Active').length}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#155724' }}>Active Stations</div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #cce5ff, #99d6ff)',
              padding: '20px',
              borderRadius: '10px',
              textAlign: 'center',
              border: '2px solid #66c2ff'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0056b3' }}>
                {stations.length}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#0056b3' }}>Total Network</div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #fff3cd, #ffeaa7)',
              padding: '20px',
              borderRadius: '10px',
              textAlign: 'center',
              border: '2px solid #ffc107'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#856404' }}>
                {stations.filter(s => s.connectivity === 'Online').length}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#856404' }}>Online Now</div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #e2d5f1, #d1c4e9)',
              padding: '20px',
              borderRadius: '10px',
              textAlign: 'center',
              border: '2px solid #9c27b0'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#6a1b9a' }}>5</div>
              <div style={{ fontSize: '0.9rem', color: '#6a1b9a' }}>Districts Covered</div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div style={{
        background: 'white',
        borderRadius: '15px',
        padding: '25px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{
          fontSize: '1.3rem',
          fontWeight: '600',
          color: '#333',
          margin: '0 0 20px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          🗺️ Weather Stations Map
          <span style={{ fontSize: '0.9rem', fontWeight: 'normal', color: '#666' }}>
            ({mapView} view)
          </span>
        </h3>
        
        {/* Enhanced Map Placeholder */}
        <div style={{
          background: 'linear-gradient(135deg, #e3f2fd 0%, #e8f5e8 100%)',
          borderRadius: '12px',
          height: '500px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          border: '3px dashed #ccc',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Background pattern */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '30px 30px'
          }} />
          
          {/* Simulated station markers */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{ position: 'relative', width: '300px', height: '200px' }}>
              {/* Station markers with different positions */}
              <div 
                style={{
                  position: 'absolute',
                  top: '60px',
                  left: '80px',
                  width: '12px',
                  height: '12px',
                  background: '#28a745',
                  borderRadius: '50%',
                  boxShadow: '0 0 10px rgba(40,167,69,0.6)',
                  cursor: 'pointer',
                  animation: 'pulse 2s infinite'
                }}
                title="Shadnagar Agricultural Station"
                onClick={() => setSelectedStation(stations[0])}
              />
              <div 
                style={{
                  position: 'absolute',
                  top: '100px',
                  left: '150px',
                  width: '12px',
                  height: '12px',
                  background: '#007bff',
                  borderRadius: '50%',
                  boxShadow: '0 0 10px rgba(0,123,255,0.6)',
                  cursor: 'pointer',
                  animation: 'pulse 2s infinite'
                }}
                title="Hyderabad Weather Center"
                onClick={() => setSelectedStation(stations[1])}
              />
              <div 
                style={{
                  position: 'absolute',
                  top: '130px',
                  left: '120px',
                  width: '12px',
                  height: '12px',
                  background: '#ffc107',
                  borderRadius: '50%',
                  boxShadow: '0 0 10px rgba(255,193,7,0.6)',
                  cursor: 'pointer',
                  animation: 'pulse 2s infinite'
                }}
                title="Rangareddy Rural Station"
                onClick={() => setSelectedStation(stations[2])}
              />
              <div 
                style={{
                  position: 'absolute',
                  top: '30px',
                  left: '200px',
                  width: '12px',
                  height: '12px',
                  background: '#6f42c1',
                  borderRadius: '50%',
                  boxShadow: '0 0 10px rgba(111,66,193,0.6)',
                  cursor: 'pointer',
                  animation: 'pulse 2s infinite'
                }}
                title="Warangal Agricultural Hub"
                onClick={() => setSelectedStation(stations[3])}
              />
              <div 
                style={{
                  position: 'absolute',
                  top: '40px',
                  left: '70px',
                  width: '12px',
                  height: '12px',
                  background: '#dc3545',
                  borderRadius: '50%',
                  boxShadow: '0 0 10px rgba(220,53,69,0.6)',
                  cursor: 'pointer'
                }}
                title="Nizamabad Cotton Station (Offline)"
                onClick={() => setSelectedStation(stations[4])}
              />
            </div>
          </div>
          
          <div style={{
            textAlign: 'center',
            color: '#666',
            zIndex: 10,
            background: 'rgba(255,255,255,0.95)',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🗺️</div>
            <p style={{ fontWeight: '600', margin: '0 0 5px 0' }}>Interactive Weather Station Map</p>
            <p style={{ fontSize: '0.9rem', color: '#999', margin: '0 0 10px 0' }}>Google Maps integration ready</p>
            <p style={{ fontSize: '0.8rem', color: '#ff6b35', margin: 0 }}>📍 Click markers to view station details</p>
          </div>
        </div>

        {/* Map Controls */}
        <div style={{
          marginTop: '15px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          {['🔍 Zoom In', '🔍 Zoom Out', '📍 My Location', '🌡️ Weather Overlay'].map((control, index) => (
            <button 
              key={index}
              style={{
                padding: '8px 15px',
                background: '#f8f9fa',
                color: '#333',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#e9ecef';
                e.target.style.borderColor = '#adb5bd';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#f8f9fa';
                e.target.style.borderColor = '#ddd';
              }}
            >
              {control}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Station Details */}
      {selectedStation && (
        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '25px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          border: '2px solid #ff6b35'
        }}>
          <h3 style={{
            fontSize: '1.3rem',
            fontWeight: '600',
            color: '#ff6b35',
            margin: '0 0 20px 0'
          }}>
            📊 {selectedStation.name}
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
            marginBottom: '20px'
          }}>
            <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
              <strong>Type:</strong> {selectedStation.type}
            </div>
            <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
              <strong>District:</strong> {selectedStation.district}
            </div>
            <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
              <strong>Status:</strong> 
              <span style={{
                marginLeft: '8px',
                padding: '3px 8px',
                borderRadius: '12px',
                fontSize: '0.8rem',
                fontWeight: '600',
                background: selectedStation.status === 'Active' ? '#d4edda' : '#fff3cd',
                color: selectedStation.status === 'Active' ? '#155724' : '#856404'
              }}>
                {selectedStation.status}
              </span>
            </div>
            <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
              <strong>Last Update:</strong> {selectedStation.lastUpdated}
            </div>
          </div>

          {/* Current Readings */}
          {selectedStation.status === 'Active' && selectedStation.connectivity === 'Online' && (
            <div>
              <h4 style={{ color: '#333', marginBottom: '15px' }}>Current Readings:</h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '10px'
              }}>
                {selectedStation.currentTemp && (
                  <div style={{
                    background: 'linear-gradient(135deg, #ffebee, #ffcdd2)',
                    padding: '15px',
                    borderRadius: '8px',
                    textAlign: 'center',
                    border: '1px solid #ef5350'
                  }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#c62828' }}>
                      {selectedStation.currentTemp}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#c62828' }}>Temperature</div>
                  </div>
                )}
                {selectedStation.humidity && (
                  <div style={{
                    background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
                    padding: '15px',
                    borderRadius: '8px',
                    textAlign: 'center',
                    border: '1px solid #42a5f5'
                  }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1565c0' }}>
                      {selectedStation.humidity}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#1565c0' }}>Humidity</div>
                  </div>
                )}
                {selectedStation.rainfall && (
                  <div style={{
                    background: 'linear-gradient(135deg, #e8f5e8, #c8e6c9)',
                    padding: '15px',
                    borderRadius: '8px',
                    textAlign: 'center',
                    border: '1px solid #66bb6a'
                  }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2e7d32' }}>
                      {selectedStation.rainfall}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#2e7d32' }}>Rainfall</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stations Grid */}
      <div style={{
        background: 'white',
        borderRadius: '15px',
        padding: '25px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{
          fontSize: '1.3rem',
          fontWeight: '600',
          color: '#333',
          margin: '0 0 25px 0'
        }}>
          🏢 Weather Stations Network ({stations.length} stations)
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {stations.map((station) => (
            <div
              key={station.id}
              onClick={() => setSelectedStation(station)}
              style={{
                background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
                borderRadius: '12px',
                padding: '20px',
                borderLeft: '4px solid #ff6b35',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 5px 15px rgba(0,0,0,0.08)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-5px)';
                e.target.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 5px 15px rgba(0,0,0,0.08)';
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '15px'
              }}>
                <h4 style={{
                  fontWeight: '600',
                  color: '#333',
                  margin: 0,
                  fontSize: '1.1rem'
                }}>
                  {station.name}
                </h4>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  background: station.status === 'Active' ? '#d4edda' : 
                             station.status === 'Maintenance' ? '#fff3cd' : '#f8d7da',
                  color: station.status === 'Active' ? '#155724' : 
                         station.status === 'Maintenance' ? '#856404' : '#721c24'
                }}>
                  {station.status}
                </span>
              </div>
              
              <div style={{ fontSize: '0.9rem', color: '#666', lineHeight: '1.4' }}>
                <p style={{ margin: '5px 0' }}>
                  <strong>Type:</strong> {station.type} | <strong>District:</strong> {station.district}
                </p>
                <p style={{ margin: '5px 0' }}>
                  <strong>Connectivity:</strong> 
                  <span style={{
                    color: station.connectivity === 'Online' ? '#28a745' : '#dc3545',
                    fontWeight: '600'
                  }}>
                    {station.connectivity}
                  </span>
                </p>
                <p style={{ margin: '5px 0', fontSize: '0.8rem', color: '#999' }}>
                  Last update: {station.lastUpdated}
                </p>
              </div>

              {/* Parameters */}
              <div style={{ marginTop: '15px' }}>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '5px'
                }}>
                  {station.parameters.map((param, index) => (
                    <span
                      key={index}
                      style={{
                        padding: '3px 8px',
                        background: '#ff6b35',
                        color: 'white',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      }}
                    >
                      {param}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
          }
        `}
      </style>
    </div>
  );
};

export default WeatherStations;
