import React, { useState, useEffect, useRef } from 'react';

const FarmPlotsMap = ({ uploadedImageCoordinates = [] }) => {
  const [plots, setPlots] = useState([]);
  const [highlightedPlotId, setHighlightedPlotId] = useState(null);
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
    if (!loading && mapsLoaded && window.google && plots !== null) {
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

  // ADD this debug code in the loadFarmPlots function:
  const loadFarmPlots = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/dashboard`);
      const data = await response.json();

      // DEBUG: Log the full data structure
      console.log('Full dashboard data:', data);
      console.log('First plant data:', data[0]?.plants?.[0]);

      const allPlants = [];
      let plotIndex = 1;

      data.forEach((document) => {
        if (document.plants && Array.isArray(document.plants)) {
          document.plants.forEach((plant) => {
            if (plant.latitude && plant.longitude) {
              console.log('Plant data:', plant); // DEBUG: Check individual plant
              allPlants.push({
                plotId: `${plant.cropType}-${plotIndex}`,
                cropType: plant.cropType,
                latitude: plant.latitude,
                longitude: plant.longitude,
                fileName: plant.fileName || 'N/A',
                cloudinaryUrl: plant.cloudinaryUrl // Make sure this is included
              });
              plotIndex++;
            }
          });
        }
      });

      console.log('Processed plants:', allPlants); // DEBUG: Check processed data
      setPlots(allPlants);
      setLoading(false);
    } catch (error) {
      console.error('Error loading farm plots:', error);
      setLoading(false);
    }
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
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                <path fill="#FF6B35" stroke="#D63031" stroke-width="1.5" d="M12,2 Q8,6 8,12 Q8,16 12,20 Q16,16 16,12 Q16,6 12,2 Z"/>
                <circle cx="12" cy="12" r="3" fill="white"/>
                <text x="12" y="14" text-anchor="middle" fill="#D63031" font-size="6" font-weight="bold">📷</text>
              </svg>
            `),
            scaledSize: { width: 20, height: 20 },
            anchor: { x: 10, y: 20 }
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

    const validImageCoordinates = uploadedImageCoordinates.filter(img => img.location);

    if (validImageCoordinates.length > 0 && mapInstanceRef.current && plots.length === 0) {
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

  const initializeMap = () => {
    if (!window.google || !mapRef.current) {
      console.error('Google Maps not loaded or map container not available');
      return;
    }

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    let mapCenter = { lat: 17.7231, lng: 78.4480 };
    let mapZoom = 5;

    const validPlots = plots.filter(plot => plot.latitude && plot.longitude);
    if (validPlots.length > 0) {
      // Select a random plant from any available plots
      const randomPlot = validPlots[Math.floor(Math.random() * validPlots.length)];
      mapCenter = {
        lat: parseFloat(randomPlot.latitude),
        lng: parseFloat(randomPlot.longitude)
      };
      mapZoom = 15;
      console.log('Centering map on:', randomPlot.cropType, 'at', mapCenter);
    }

    const map = new window.google.maps.Map(mapRef.current, {
      zoom: mapZoom,
      center: mapCenter,
      mapTypeId: 'hybrid',
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false
    });

    mapInstanceRef.current = map;


    // Color map for more crop types
    const cropColorMap = {
      mango:    { marker: '#FF9800', stroke: '#F57C00' },
      cotton:   { marker: '#E3F2FD', stroke: '#1976D2' },
      wheat:    { marker: '#FDD835', stroke: '#FBC02D' },
      rice:     { marker: '#AED581', stroke: '#689F38' },
      corn:     { marker: '#FFF176', stroke: '#FBC02D' },
      tomato:   { marker: '#FF5252', stroke: '#B71C1C' },
      potato:   { marker: '#A1887F', stroke: '#4E342E' },
      chili:    { marker: '#D50000', stroke: '#B71C1C' },
      default:  { marker: '#4CAF50', stroke: '#2E7D32' }
    };

    plots.forEach((plot, index) => {
      if (plot.latitude && plot.longitude) {
        // Determine color by crop type
        const cropKey = Object.keys(cropColorMap).find(key => plot.cropType.toLowerCase().includes(key)) || 'default';
        const { marker: markerColor, stroke: strokeColor } = cropColorMap[cropKey];

        // Highlight marker if selected/hovered
        const isHighlighted = highlightedPlotId === plot.plotId;
        const markerSvg = `
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
            <circle cx="14" cy="22" r="4" fill="${markerColor}" stroke="${strokeColor}" stroke-width="2"/>
            <path fill="${strokeColor}" d="M14,3 Q11,6 11,12 Q11,18 14,25 Q17,18 17,12 Q17,6 14,3 Z"/>
            <circle cx="14" cy="12" r="3" fill="${markerColor}"/>
            ${isHighlighted ? '<circle cx="14" cy="12" r="7" fill="none" stroke="#FFD600" stroke-width="2"/>' : ''}
          </svg>
        `;

        const marker = new window.google.maps.Marker({
          position: {
            lat: parseFloat(plot.latitude),
            lng: parseFloat(plot.longitude)
          },
          map: map,
          title: `${plot.cropType} - ${plot.plotId}`,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(markerSvg),
            scaledSize: { width: 28, height: 28 },
            anchor: { x: 14, y: 28 }
          },
          zIndex: isHighlighted ? 999 : 1
        });

        marker.addListener('mouseover', () => {
          setHighlightedPlotId(plot.plotId);
        });
        marker.addListener('mouseout', () => {
          setHighlightedPlotId(null);
        });
        marker.addListener('click', () => {
          setSelectedPlot(plot);
          setClickedCoordinate({
            lat: parseFloat(plot.latitude),
            lng: parseFloat(plot.longitude),
            plotId: plot.plotId,
            cropType: plot.cropType,
            fileName: plot.fileName,
            serial: index + 1
          });
          setShowCoordinatePopup(true);
          setHighlightedPlotId(plot.plotId);
        });

        markersRef.current.push(marker);
      }
    });

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
          Loading plant locations...
        </p>
        <p style={{ color: '#666', fontSize: '0.9rem' }}>
          Fetching data from dashboard endpoint
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
              {clickedCoordinate.lat}, {clickedCoordinate.lng}
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
      {/* <div style={{
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
      </div> */}

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
                  Loading plant locations from dashboard...
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

          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              background: 'white',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <thead>
                <tr style={{ background: '#4CAF50', color: 'white' }}>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>#</th>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>File Name</th>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Crop Type</th>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Latitude</th>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Longitude</th>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Image View</th>
                </tr>
              </thead>
              <tbody>
                {plots.map((plot, index) => (
                  <tr key={index} style={{
                    borderBottom: index < plots.length - 1 ? '1px solid #eee' : 'none',
                    transition: 'background-color 0.2s ease'
                  }}
                    onMouseEnter={(e) => e.target.parentElement.style.backgroundColor = '#f8f9fa'}
                    onMouseLeave={(e) => e.target.parentElement.style.backgroundColor = 'transparent'}
                  >
                    <td style={{
                      padding: '12px 15px',
                      fontFamily: 'monospace',
                      fontSize: '0.9rem',
                      color: '#666'
                    }}>
                      {plot.fileName}
                    </td>
                    <td style={{
                      padding: '12px 15px',
                      fontWeight: '500'
                    }}>
                      {plot.cropType}
                    </td>
                    <td style={{
                      padding: '12px 15px',
                      fontFamily: 'monospace',
                      fontSize: '0.9rem'
                    }}>
                      {parseFloat(plot.latitude).toFixed(6)}
                    </td>
                    <td style={{
                      padding: '12px 15px',
                      fontFamily: 'monospace',
                      fontSize: '0.9rem'
                    }}>
                      {parseFloat(plot.longitude).toFixed(6)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '15px'
          }}>
            <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
              <strong>{selectedPlot.isImage ? 'Image ID:' : 'Plot ID:'}</strong> {selectedPlot.plotId}
            </div>
            <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
              <strong>Type:</strong> {selectedPlot.cropType}
            </div>
            {!selectedPlot.isImage && (
              <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                <strong>Source File:</strong> {selectedPlot.fileName}
              </div>
            )}
            {selectedPlot.isImage && (
              <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                <strong>Coordinates:</strong> {parseFloat(selectedPlot.location?.latitude)}, {parseFloat(selectedPlot.location?.longitude)}
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
