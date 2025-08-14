import React, { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocationMap = ({ 
  onLocationSelect, 
  initialLocation = null,
  height = '400px',
  center = [-16.409047, -71.537451] // Arequipa, Perú
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [position, setPosition] = useState(
    initialLocation ? [initialLocation.lat, initialLocation.lng] : null
  );

  const initializeMap = useCallback(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
    
    if (markerRef.current) {
      markerRef.current = null;
    }

    if (mapRef.current) {
      const mapCenter = position || center;
      const map = L.map(mapRef.current, {
        center: mapCenter,
        zoom: 13,
        zoomControl: true,
        scrollWheelZoom: true,
        touchZoom: true,
        dragging: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Agregar marcador si hay posición
      if (position) {
        markerRef.current = L.marker(position, { draggable: true }).addTo(map);
        
        markerRef.current.on('dragend', (e) => {
          const newPos = [e.target.getLatLng().lat, e.target.getLatLng().lng];
          setPosition(newPos);
          onLocationSelect && onLocationSelect({
            lat: e.target.getLatLng().lat,
            lng: e.target.getLatLng().lng
          });
        });
      }

      // Manejar clicks en el mapa
      map.on('click', (e) => {
        const newPos = [e.latlng.lat, e.latlng.lng];
        setPosition(newPos);
        
        // Remover marcador anterior
        if (markerRef.current) {
          map.removeLayer(markerRef.current);
        }
        
        // Agregar nuevo marcador
        markerRef.current = L.marker(newPos, { draggable: true }).addTo(map);
        
        markerRef.current.on('dragend', (e) => {
          const dragPos = [e.target.getLatLng().lat, e.target.getLatLng().lng];
          setPosition(dragPos);
          onLocationSelect && onLocationSelect({
            lat: e.target.getLatLng().lat,
            lng: e.target.getLatLng().lng
          });
        });
        
        onLocationSelect && onLocationSelect({
          lat: e.latlng.lat,
          lng: e.latlng.lng
        });
      });

      mapInstanceRef.current = map;
    }
  }, [position, center, onLocationSelect]);

  useEffect(() => {
    if (mapRef.current) {
      // Pequeño delay para asegurar que el DOM está listo
      const timer = setTimeout(initializeMap, 50);
      return () => clearTimeout(timer);
    }
  }, [initializeMap]);

  useEffect(() => {
    if (initialLocation) {
      setPosition([initialLocation.lat, initialLocation.lng]);
    }
  }, [initialLocation]);

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Función para buscar por dirección (geocoding simple)
  const searchAddress = async (address) => {
    try {
      // Usar servicio gratuito de geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ', Arequipa, Perú')}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        const newPos = [lat, lng];
        
        setPosition(newPos);
        onLocationSelect && onLocationSelect({ lat, lng });
        return { success: true, position: { lat, lng } };
      }
      return { success: false, error: 'Ubicación no encontrada' };
    } catch (error) {
      console.error('Error buscando ubicación:', error);
      return { success: false, error: 'Error en la búsqueda' };
    }
  };

  // Función de búsqueda disponible (sin useImperativeHandle por ahora)

  return (
    <div className="location-map-container">
      <div 
        ref={mapRef}
        style={{ height: height, width: '100%', borderRadius: '8px' }}
      />
      
      {position && (
        <div className="location-info">
          <small>
            📍 Ubicación seleccionada: {position[0].toFixed(6)}, {position[1].toFixed(6)}
          </small>
        </div>
      )}
      
      <div className="map-instructions">
        <small>
          💡 Haz click en el mapa o arrastra el marcador para seleccionar la ubicación exacta
        </small>
      </div>

      <style jsx>{`
        .location-map-container {
          width: 100%;
          border: 1px solid #ddd;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .location-info {
          padding: 0.5rem;
          background: #f8f9fa;
          text-align: center;
          color: #666;
          font-size: 0.9rem;
          border-top: 1px solid #eee;
        }

        .map-instructions {
          padding: 0.5rem;
          background: #e3f2fd;
          text-align: center;
          color: #1976d2;
          font-size: 0.85rem;
          border-top: 1px solid #bbdefb;
        }
      `}</style>
    </div>
  );
};

export default LocationMap;