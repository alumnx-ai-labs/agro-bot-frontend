import React, { useState, useEffect, useRef } from 'react';

const FarmPlotsMap = () => {
  const [plots, setPlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [farmerId, setFarmerId] = useState('lkjlkjrl3jhr23h4343');
  const [showCoordinatePopup, setShowCoordinatePopup] = useState(false);
  const [clickedCoordinate, setClickedCoordinate] = useState(null);
  
  // Google Maps refs
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    loadGoogleMaps();
    loadFarmPlots();
  }, []);

  // Initialize map when plots are loaded and Google Maps is available
  useEffect(() => {
    if (plots.length > 0 && !loading && mapsLoaded && window.google) {
      initializeMap();
    }
  }, [plots, loading, mapsLoaded]);

  // Load Google Maps script dynamically
  const loadGoogleMaps = () => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      setMapsLoaded(true);
      return;
    }

    // Check if script is already being loaded
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      setMapsLoaded(true);
    };
    
    script.onerror = () => {
      console.error('Failed to load Google Maps script');
    };

    document.head.appendChild(script);
  };

  const loadFarmPlots = async () => {
    try {
      // Simulate API call to /farm-map-data endpoint
      const response = await simulateBackendCall();
      
      setTimeout(() => {
        setPlots(response);
        setLoading(false);
      }, 1000);

    } catch (error) {
      console.error('Error loading farm plots:', error);
      setLoading(false);
    }
  };

  // Simulate backend response based on the chat conversation
  const simulateBackendCall = async () => {
    // Simulate POST request to /farm-map-data with farmerId
    const requestPayload = {
      "farmerId": farmerId
    };

    console.log('POST /farm-map-data:', requestPayload);

    // Simulate backend response with multiple farm plots
    return [
      {
        "plotId": "lkl3k24j3l2j4324",
        "latitude": "17.0993",
        "longitude": "78.2048",
        "cropType": "Cotton"
      },
      {
        "plotId": "mkn5k35j4m3j5435",
        "latitude": "17.3850",
        "longitude": "78.4867",
        "cropType": "Rice"
      },
      {
        "plotId": "pqr6k46j5p4j6546",
        "latitude": "17.2403",
        "longitude": "78.4294",
        "cropType": "Wheat"
      },
      {
        "plotId": "rst7k57j6r5j7657",
        "latitude": "17.9689",
        "longitude": "79.5941",
        "cropType": "Maize"
      },
      {
        "plotId": "uvw8k68j7u6j8768",
        "latitude": "18.6725",
        "longitude": "78.0941",
        "cropType": "Sugarcane"
      },
      {
        "plotId": "xyz9k79j8x7j9879",
        "latitude": "17.4463",
        "longitude": "78.3910",
        "cropType": "Sunflower"
      },
      {
        "plotId": "abc0k80j9a8j0980",
        "latitude": "17.5531",
        "longitude": "78.5673",
        "cropType": "Groundnut"
      },
      {
        "plotId": "def1k91j0d9j1091",
        "latitude": "17.8142",
        "longitude": "78.7234",
        "cropType": "Soybean"
      },
      {
        "plotId": "ghi2k02j1g0j2102",
        "latitude": "17.1756",
        "longitude": "78.6541",
        "cropType": "Tomato"
      },
      {
        "plotId": "jkl3k13j2j1j3213",
        "latitude": "17.6288",
        "longitude": "78.1897",
        "cropType": "Onion"
      }
    ];
  };

  // Google Maps initialization with tree markers
  const initializeMap = () => {
    if (!window.google || !mapRef.current) {
      console.error('Google Maps not loaded or map container not available');
      return;
    }

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Center map on first plot or default location
    const center = plots.length > 0 ? 
      { lat: parseFloat(plots[0].latitude), lng: parseFloat(plots[0].longitude) } :
      { lat: 17.7231, lng: 78.4480 };
    
    const map = new window.google.maps.Map(mapRef.current, {
      zoom: 8,
      center: center,
      mapTypeId: 'hybrid'
    });

    mapInstanceRef.current = map;

    // Add markers for each farm plot
    plots.forEach((plot) => {
      const marker = new window.google.maps.Marker({
        position: { lat: parseFloat(plot.latitude), lng: parseFloat(plot.longitude) },
        map: map,
        title: `${plot.cropType} Farm - ${plot.plotId}`,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24">
              <path fill="#4CAF50" stroke="#2E7D32" stroke-width="1" d="M12,1L8,5V8L5,11V16H7.5V22H16.5V16H19V11L16,8V5L12,1M12,3.5L15,6.5V8.5L17,10.5V14H15V20H9V14H7V10.5L9,8.5V6.5L12,3.5Z"/>
              <circle cx="12" cy="6" r="2" fill="#81C784"/>
              <circle cx="10" cy="10" r="1.5" fill="#A5D6A7"/>
              <circle cx="14" cy="10" r="1.5" fill="#A5D6A7"/>
              <circle cx="12" cy="12" r="1" fill="#C8E6C9"/>
            </svg>
          `),
          scaledSize: { width: 30, height: 30 },
          anchor: { x: 15, y: 30 }
        }
      });

      marker.addListener('click', () => {
        setSelectedPlot(plot);
        setClickedCoordinate({
          lat: parseFloat(plot.latitude),
          lng: parseFloat(plot.longitude),
          plotId: plot.plotId,
          cropType: plot.cropType
        });
        setShowCoordinatePopup(true);
      });

      markersRef.current.push(marker);
    });
  };

  const closeCoordinatePopup = () => {
    setShowCoordinatePopup(false);
    setClickedCoordinate(null);
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
          borderTop: '5px solid #4CAF50',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px'
        }}></div>
        <p style={{ fontSize: '1.2rem', fontWeight: '600', color: '#333', marginBottom: '10px' }}>
          Loading farm plots...
        </p>
        <p style={{ color: '#666', fontSize: '0.9rem' }}>
          Farmer ID: {farmerId}
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
      {/* Coordinate Popup */}
      {showCoordinatePopup && clickedCoordinate && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'white',
          border: '2px solid #ddd',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
          zIndex: 1000,
          minWidth: '300px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '15px'
          }}>
            <h4 style={{
              margin: 0,
              fontSize: '1.1rem',
              fontWeight: '600',
              color: '#333'
            }}>
              {clickedCoordinate.plotId}
            </h4>
            <button
              onClick={closeCoordinatePopup}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '18px',
                cursor: 'pointer',
                color: '#666',
                padding: '0',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ×
            </button>
          </div>
          
          <div style={{ marginBottom: '10px' }}>
            <strong style={{ color: '#666', fontSize: '0.9rem' }}>Coordinates:</strong>
            <div style={{ 
              fontSize: '0.95rem', 
              color: '#333',
              fontFamily: 'monospace',
              marginTop: '5px'
            }}>
              {clickedCoordinate.lat.toFixed(6)}, {clickedCoordinate.lng.toFixed(6)}
            </div>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <strong style={{ color: '#666', fontSize: '0.9rem' }}>Type:</strong>
            <div style={{ fontSize: '0.95rem', color: '#333', marginTop: '5px' }}>
              {clickedCoordinate.cropType}
            </div>
          </div>
        </div>
      )}

      {/* Overlay for popup */}
      {showCoordinatePopup && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.3)',
            zIndex: 999
          }}
          onClick={closeCoordinatePopup}
        />
      )}

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
          margin: '0 0 20px 0'
        }}>
          🗺️ Farm Plots Map
        </h3>
        
        {/* Google Maps Container */}
        <div style={{
          background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
          borderRadius: '12px',
          height: '500px',
          border: '3px dashed #4CAF50',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Google Maps will render here */}
          <div 
            ref={mapRef}
            style={{ 
              height: '100%', 
              width: '100%',
              borderRadius: '12px'
            }}
          >
            {/* Fallback content when Google Maps is not loaded */}
            {!mapsLoaded && (
              <div style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                color: '#666',
                background: 'rgba(255,255,255,0.95)',
                padding: '20px',
                borderRadius: '10px'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🗺️</div>
                <p style={{ fontWeight: '600', margin: '0 0 5px 0' }}>
                  Loading Google Maps...
                </p>
                <p style={{ fontSize: '0.8rem', color: '#4CAF50', margin: 0 }}>
                  🌳 Click tree markers to view coordinates
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Selected Plot Details */}
      {selectedPlot && (
        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '25px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          border: '2px solid #4CAF50'
        }}>
          <h3 style={{
            fontSize: '1.3rem',
            fontWeight: '600',
            color: '#4CAF50',
            margin: '0 0 20px 0'
          }}>
            🌾 {selectedPlot.cropType} Farm Plot
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px'
          }}>
            <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
              <strong>Plot ID:</strong> {selectedPlot.plotId}
            </div>
            <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
              <strong>Crop Type:</strong> {selectedPlot.cropType}
            </div>
            <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
              <strong>Coordinates:</strong> {parseFloat(selectedPlot.latitude).toFixed(6)}, {parseFloat(selectedPlot.longitude).toFixed(6)}
            </div>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default FarmPlotsMap;
