import React, { useState, useEffect, useRef } from 'react';

const FarmPlotsMap = ({ uploadedImageCoordinates = [] }) => {
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
  const imageMarkersRef = useRef([]);

  useEffect(() => {
    loadGoogleMaps();
    loadFarmPlots();
  }, []);

  // Initialize map when plots are loaded and Google Maps is available
  useEffect(() => {
    if (!loading && mapsLoaded && window.google) {
      initializeMap();
    }
  }, [plots, loading, mapsLoaded]);

  // Update image markers when uploadedImageCoordinates change
  useEffect(() => {
    if (mapsLoaded && window.google && mapInstanceRef.current) {
      updateImageMarkers();
    }
  }, [uploadedImageCoordinates, mapsLoaded]);

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

  // Simulate backend response - now without coordinates
  const simulateBackendCall = async () => {
    // Simulate POST request to /farm-map-data with farmerId
    const requestPayload = {
      "farmerId": farmerId
    };

    console.log('POST /farm-map-data:', requestPayload);

    // Simulate backend response - removed coordinates to not plot on map
    return [
      {
        "plotId": "lkl3k24j3l2j4324",
        "cropType": "Cotton"
        // Removed latitude and longitude to prevent plotting
      }
    ];
  };

  // Update image markers on the map
  const updateImageMarkers = () => {
    if (!mapInstanceRef.current || !window.google) return;

    // Clear existing image markers
    imageMarkersRef.current.forEach(marker => marker.setMap(null));
    imageMarkersRef.current = [];

    // Add markers for uploaded images with coordinates
    uploadedImageCoordinates.forEach((imageData, index) => {
      if (imageData.location) {
        const marker = new window.google.maps.Marker({
          position: { 
            lat: parseFloat(imageData.location.latitude), 
            lng: parseFloat(imageData.location.longitude) 
          },
          map: mapInstanceRef.current,
          title: `Uploaded Image: ${imageData.fileName}`,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" fill="#FF6B35" stroke="#D63031" stroke-width="2"/>
                <path fill="white" d="M9,12 L12,15 L15,9" stroke="white" stroke-width="1.5"/>
                <text x="12" y="4" text-anchor="middle" fill="#D63031" font-size="8" font-weight="bold">IMG</text>
              </svg>
            `),
            scaledSize: { width: 35, height: 35 },
            anchor: { x: 17.5, y: 35 }
          }
        });

        marker.addListener('click', () => {
          setSelectedPlot({
            ...imageData,
            plotId: `IMG-${index + 1}`,
            cropType: 'Uploaded Image',
            isImage: true
          });
          setClickedCoordinate({
            lat: parseFloat(imageData.location.latitude),
            lng: parseFloat(imageData.location.longitude),
            plotId: `IMG-${index + 1}`,
            cropType: 'Uploaded Image',
            fileName: imageData.fileName,
            predictions: imageData.predictions,
            isImage: true
          });
          setShowCoordinatePopup(true);
        });

        imageMarkersRef.current.push(marker);
      }
    });

    // If we have image coordinates, adjust map bounds to include them immediately
    const validImageCoordinates = uploadedImageCoordinates.filter(img => img.location);
    
    if (validImageCoordinates.length > 0 && mapInstanceRef.current) {
      // Wait a moment for markers to be added to the map
      setTimeout(() => {
        const bounds = new window.google.maps.LatLngBounds();
        
        // Include all uploaded image coordinates
        validImageCoordinates.forEach(imageData => {
          bounds.extend(new window.google.maps.LatLng(
            parseFloat(imageData.location.latitude), 
            parseFloat(imageData.location.longitude)
          ));
        });
        
        // Fit bounds with padding for better visibility
        mapInstanceRef.current.fitBounds(bounds, {
          top: 80,
          right: 80,
          bottom: 80,
          left: 80
        });
        
        // Ensure reasonable zoom level
        setTimeout(() => {
          if (mapInstanceRef.current) {
            const currentZoom = mapInstanceRef.current.getZoom();
            
            if (validImageCoordinates.length === 1) {
              // For single image, use zoom level 15
              mapInstanceRef.current.setZoom(15);
            } else if (currentZoom > 17) {
              // For multiple images, don't zoom too close
              mapInstanceRef.current.setZoom(17);
            } else if (currentZoom < 10) {
              // Don't zoom too far out either
              mapInstanceRef.current.setZoom(10);
            }
          }
        }, 200);
      }, 100);
    }
  };

  // Google Maps initialization - now with default location since no farm plot coordinates
  const initializeMap = () => {
    if (!window.google || !mapRef.current) {
      console.error('Google Maps not loaded or map container not available');
      return;
    }

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Use default center location (Hyderabad, India) since no farm coordinates
    const defaultCenter = { lat: 17.7231, lng: 78.4480 };
    
    const map = new window.google.maps.Map(mapRef.current, {
      zoom: 8,
      center: defaultCenter,
      mapTypeId: 'hybrid'
    });

    mapInstanceRef.current = map;

    // Add image markers if available - this will auto-adjust the map view
    updateImageMarkers();
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
          Loading farm data...
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
          minWidth: '300px',
          maxWidth: '500px'
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
              color: clickedCoordinate.isImage ? '#FF6B35' : '#333'
            }}>
              {clickedCoordinate.isImage ? '📷 ' : '🌱 '}{clickedCoordinate.plotId}
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

          {clickedCoordinate.isImage && clickedCoordinate.fileName && (
            <div style={{ marginBottom: '10px' }}>
              <strong style={{ color: '#666', fontSize: '0.9rem' }}>File Name:</strong>
              <div style={{ fontSize: '0.95rem', color: '#333', marginTop: '5px' }}>
                {clickedCoordinate.fileName}
              </div>
            </div>
          )}

          {clickedCoordinate.isImage && clickedCoordinate.predictions && (
            <div style={{ marginTop: '15px' }}>
              <strong style={{ color: '#666', fontSize: '0.9rem' }}>Predictions:</strong>
              <div style={{ marginTop: '8px' }}>
                {clickedCoordinate.predictions.slice(0, 3).map((pred, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '5px 0',
                    borderBottom: index < 2 ? '1px solid #eee' : 'none'
                  }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>
                      {pred.className}
                    </span>
                    <span style={{
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      color: pred.probability > 0.5 ? '#28a745' : '#6c757d',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      background: pred.probability > 0.5 ? '#d4edda' : '#f8f9fa'
                    }}>
                      {(pred.probability * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
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

      {/* Farmer Info Card */}
      <div style={{
        background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
        borderRadius: '15px',
        padding: '20px',
        boxShadow: '0 10px 30px rgba(76, 175, 80, 0.3)',
        color: 'white',
        textAlign: 'center'
      }}>
        <h2 style={{ margin: '0 0 10px 0', fontSize: '1.5rem' }}>
          👨‍🌾 Farmer Dashboard
        </h2>
        <p style={{ margin: '0', fontSize: '1.1rem', fontWeight: '600' }}>
          Farmer ID: <span style={{ fontFamily: 'monospace', background: 'rgba(255,255,255,0.2)', padding: '4px 8px', borderRadius: '4px' }}>{farmerId}</span>
        </p>
      </div>

      {/* Map Section */}
      <div style={{
        background: 'white',
        borderRadius: '15px',
        padding: '25px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h3 style={{
            fontSize: '1.3rem',
            fontWeight: '600',
            color: '#333',
            margin: 0
          }}>
            🗺️ Farm Monitoring Map
          </h3>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '16px',
                height: '16px',
                background: '#4CAF50',
                borderRadius: '50%',
                border: '2px solid #2E7D32'
              }}></div>
              <span style={{ fontSize: '0.9rem', color: '#666' }}>
                Farmer Info
              </span>
            </div>
            {uploadedImageCoordinates.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  background: '#FF6B35',
                  borderRadius: '50%',
                  border: '2px solid #D63031'
                }}></div>
                <span style={{ fontSize: '0.9rem', color: '#666' }}>
                  Uploaded Images ({uploadedImageCoordinates.filter(img => img.location).length})
                </span>
              </div>
            )}
          </div>
        </div>
        
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
                <p style={{ fontWeight: '600', margin: '0 0 10px 0' }}>
                  Loading Google Maps...
                </p>
                <p style={{ fontSize: '0.9rem', color: '#4CAF50', margin: '0 0 5px 0' }}>
                  👨‍🌾 Farmer ID: {farmerId}
                </p>
                <p style={{ fontSize: '0.8rem', color: '#FF6B35', margin: 0 }}>
                  📷 Orange markers: Uploaded images
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Farm Plot Info (without coordinates) */}
      {plots.length > 0 && (
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
            🌾 Farm Plot Information
          </h3>
          
          {plots.map((plot, index) => (
            <div key={index} style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px',
              marginBottom: index < plots.length - 1 ? '20px' : '0',
              paddingBottom: index < plots.length - 1 ? '20px' : '0',
              borderBottom: index < plots.length - 1 ? '1px solid #eee' : 'none'
            }}>
              <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                <strong>Plot ID:</strong> {plot.plotId}
              </div>
              <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                <strong>Crop Type:</strong> {plot.cropType}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected Plot Details */}
      {selectedPlot && (
        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '25px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          border: `2px solid ${selectedPlot.isImage ? '#FF6B35' : '#4CAF50'}`
        }}>
          <h3 style={{
            fontSize: '1.3rem',
            fontWeight: '600',
            color: selectedPlot.isImage ? '#FF6B35' : '#4CAF50',
            margin: '0 0 20px 0'
          }}>
            {selectedPlot.isImage ? '📷' : '🌾'} {selectedPlot.cropType} {selectedPlot.isImage ? '' : 'Farm Plot'}
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px'
          }}>
            <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
              <strong>{selectedPlot.isImage ? 'Image ID:' : 'Plot ID:'}</strong> {selectedPlot.plotId}
            </div>
            <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
              <strong>Type:</strong> {selectedPlot.cropType}
            </div>
            {selectedPlot.isImage && (
              <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                <strong>Coordinates:</strong> {parseFloat(selectedPlot.location?.latitude).toFixed(6)}, {parseFloat(selectedPlot.location?.longitude).toFixed(6)}
              </div>
            )}
            {selectedPlot.fileName && (
              <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                <strong>File Name:</strong> {selectedPlot.fileName}
              </div>
            )}
          </div>

          {selectedPlot.isImage && selectedPlot.predictions && (
            <div style={{ marginTop: '20px' }}>
              <h4 style={{ color: '#333', marginBottom: '15px' }}>🤖 Classification Results:</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {selectedPlot.predictions.slice(0, 3).map((pred, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 15px',
                    background: '#f8f9fa',
                    borderRadius: '8px',
                    borderLeft: `4px solid ${pred.probability > 0.5 ? '#28a745' : '#6c757d'}`
                  }}>
                    <span style={{ fontWeight: '600', fontSize: '1rem' }}>
                      {pred.className}
                    </span>
                    <span style={{
                      fontSize: '1rem',
                      fontWeight: '700',
                      color: pred.probability > 0.5 ? '#28a745' : '#6c757d',
                      padding: '4px 12px',
                      borderRadius: '15px',
                      background: pred.probability > 0.5 ? '#d4edda' : '#e9ecef'
                    }}>
                      {(pred.probability * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
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
