import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

const GoogleMap = ({ 
  onLocationSelect, 
  initialLocation = null,
  height = '400px',
  center = { lat: -16.409047, lng: -71.537451 } // Arequipa, Perú
}) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);

  useEffect(() => {
    const initMap = async () => {
      const loader = new Loader({
        apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
        version: 'weekly',
        libraries: ['places']
      });

      try {
        await loader.load();
        
        const mapInstance = new window.google.maps.Map(mapRef.current, {
          center: selectedLocation || center,
          zoom: 13,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        setMap(mapInstance);

        // Crear marcador inicial si hay una ubicación
        if (selectedLocation) {
          const markerInstance = new window.google.maps.Marker({
            position: selectedLocation,
            map: mapInstance,
            draggable: true,
            title: 'Ubicación de la propiedad'
          });

          setMarker(markerInstance);

          // Listener para cuando se arrastra el marcador
          markerInstance.addListener('dragend', () => {
            const position = markerInstance.getPosition();
            const location = {
              lat: position.lat(),
              lng: position.lng()
            };
            setSelectedLocation(location);
            onLocationSelect && onLocationSelect(location);
          });
        }

        // Listener para clicks en el mapa
        mapInstance.addListener('click', (event) => {
          const location = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng()
          };

          // Remover marcador anterior
          if (marker) {
            marker.setMap(null);
          }

          // Crear nuevo marcador
          const newMarker = new window.google.maps.Marker({
            position: location,
            map: mapInstance,
            draggable: true,
            title: 'Ubicación de la propiedad'
          });

          setMarker(newMarker);
          setSelectedLocation(location);
          onLocationSelect && onLocationSelect(location);

          // Listener para el nuevo marcador
          newMarker.addListener('dragend', () => {
            const position = newMarker.getPosition();
            const newLocation = {
              lat: position.lat(),
              lng: position.lng()
            };
            setSelectedLocation(newLocation);
            onLocationSelect && onLocationSelect(newLocation);
          });
        });

      } catch (error) {
        console.error('Error loading Google Maps:', error);
      }
    };

    if (!map) {
      initMap();
    }
  }, [map, selectedLocation, onLocationSelect, marker, center]);

  // Función para buscar por dirección
  const searchAddress = (address) => {
    if (!map) return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: `${address}, Arequipa, Perú` }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const location = {
          lat: results[0].geometry.location.lat(),
          lng: results[0].geometry.location.lng()
        };

        map.setCenter(location);
        map.setZoom(15);

        // Remover marcador anterior
        if (marker) {
          marker.setMap(null);
        }

        // Crear nuevo marcador
        const newMarker = new window.google.maps.Marker({
          position: location,
          map: map,
          draggable: true,
          title: 'Ubicación de la propiedad'
        });

        setMarker(newMarker);
        setSelectedLocation(location);
        onLocationSelect && onLocationSelect(location);

        // Listener para el nuevo marcador
        newMarker.addListener('dragend', () => {
          const position = newMarker.getPosition();
          const newLocation = {
            lat: position.lat(),
            lng: position.lng()
          };
          setSelectedLocation(newLocation);
          onLocationSelect && onLocationSelect(newLocation);
        });
      }
    });
  };

  // Exponer la función de búsqueda
  React.useImperativeHandle(React.forwardRef(() => ({})), () => ({
    searchAddress
  }));

  return (
    <div className="google-map-container">
      <div 
        ref={mapRef} 
        style={{ 
          width: '100%', 
          height: height,
          borderRadius: '8px',
          border: '1px solid #ddd'
        }} 
      />
      {selectedLocation && (
        <div className="location-info">
          <small>
            📍 Ubicación seleccionada: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
          </small>
        </div>
      )}
      
      <style jsx>{`
        .google-map-container {
          width: 100%;
        }
        
        .location-info {
          margin-top: 0.5rem;
          padding: 0.5rem;
          background: #f8f9fa;
          border-radius: 4px;
          text-align: center;
          color: #666;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
};

export default GoogleMap;