import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaSearch, FaBed, FaBath, FaCar, FaMapMarkerAlt, FaWhatsapp } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getPropiedades, buscarPropiedades } from '../../services/propiedades';
import './Catalogo.css';

const Catalogo = () => {
  const [searchParams] = useSearchParams();
  const [propiedades, setPropiedades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    tipo_propiedad: searchParams.get('tipo_propiedad') || '',
    precio_min: searchParams.get('precio_min') || '',
    precio_max: searchParams.get('precio_max') || '',
    dormitorios: searchParams.get('dormitorios') || '',
    banos: searchParams.get('banos') || '',
    ubicacion: searchParams.get('ubicacion') || ''
  });

  useEffect(() => {
    cargarPropiedades();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargarPropiedades = async () => {
    setLoading(true);
    try {
      // Si hay parámetros de búsqueda, buscar con filtros
      const tieneParametros = Object.values(filtros).some(value => value !== '');
      
      const result = tieneParametros 
        ? await buscarPropiedades(filtros)
        : await getPropiedades();
      
      if (result.success) {
        setPropiedades(result.data);
      } else {
        toast.error('Error al cargar las propiedades');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar las propiedades');
    }
    setLoading(false);
  };

  const handleFiltroChange = (e) => {
    setFiltros({
      ...filtros,
      [e.target.name]: e.target.value
    });
  };

  const handleBuscar = () => {
    cargarPropiedades();
  };

  const limpiarFiltros = () => {
    setFiltros({
      tipo_propiedad: '',
      precio_min: '',
      precio_max: '',
      dormitorios: '',
      banos: '',
      ubicacion: ''
    });
    // Recargar todas las propiedades
    setTimeout(() => {
      cargarPropiedades();
    }, 100);
  };

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0
    }).format(precio);
  };

  const formatearPrecioUSD = (precio) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(precio);
  };

  const handleWhatsApp = (propiedad) => {
    const phone = "51925803372";
    const message = `Hola, me interesa la propiedad: ${propiedad.titulo} - ${formatearPrecio(propiedad.precio)}`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="catalogo">
      <div className="container">
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">Catálogo de Propiedades</h1>
          <p className="page-subtitle">
            Encuentra la propiedad perfecta entre nuestra amplia selección
          </p>
        </div>

        {/* Filtros - Siempre visibles */}
        <div className="filtros-container">
          <div className="filtros-header">
            <h3>Filtros de búsqueda</h3>
          </div>

          <div className="filtros-content">
            <div className="filtros-row">
              <select 
                name="tipo_propiedad"
                value={filtros.tipo_propiedad}
                onChange={handleFiltroChange}
                className="filtro-input"
              >
                <option value="">Tipo de propiedad</option>
                <option value="casa">Casa</option>
                <option value="apartamento">Apartamento</option>
                <option value="departamento">Departamento</option>
                <option value="local">Local comercial</option>
                <option value="terreno">Terreno</option>
              </select>

              <input
                type="text"
                name="ubicacion"
                placeholder="Ubicación"
                value={filtros.ubicacion}
                onChange={handleFiltroChange}
                className="filtro-input"
              />

              <select 
                name="dormitorios"
                value={filtros.dormitorios}
                onChange={handleFiltroChange}
                className="filtro-input"
              >
                <option value="">Dormitorios</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </select>

              <select 
                name="banos"
                value={filtros.banos}
                onChange={handleFiltroChange}
                className="filtro-input"
              >
                <option value="">Baños</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </select>
            </div>

            <div className="filtros-row">
              <input
                type="number"
                name="precio_min"
                placeholder="Precio mínimo"
                value={filtros.precio_min}
                onChange={handleFiltroChange}
                className="filtro-input"
              />

              <input
                type="number"
                name="precio_max"
                placeholder="Precio máximo"
                value={filtros.precio_max}
                onChange={handleFiltroChange}
                className="filtro-input"
              />

              <button 
                onClick={handleBuscar}
                className="btn btn-primary"
              >
                <FaSearch />
                Buscar
              </button>

              <button 
                onClick={limpiarFiltros}
                className="btn btn-secondary"
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>

        {/* Resultados */}
        <div className="resultados-header">
          <h3>
            {loading ? 'Cargando...' : `${propiedades.length} propiedades encontradas`}
          </h3>
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="propiedades-grid">
            {propiedades.length === 0 ? (
              <div className="no-results">
                <h3>No se encontraron propiedades</h3>
                <p>Intenta ajustar los filtros de búsqueda</p>
              </div>
            ) : (
              propiedades.map((propiedad) => (
                <div key={propiedad.id} className="property-card">
                  <div className="property-image">
                    <img 
                      src={propiedad.imagenes_propiedades?.[0]?.url_imagen || 'https://via.placeholder.com/300x200?text=Sin+Imagen'}
                      alt={propiedad.titulo}
                      loading="lazy"
                    />
                    <div className="property-overlay">
                      <Link 
                        to={`/propiedad/${propiedad.id}`}
                        className="btn btn-outline"
                      >
                        Ver detalles
                      </Link>
                    </div>
                  </div>

                  <div className="property-content">
                    <div className="property-header">
                      <h3 className="property-title">{propiedad.titulo}</h3>
                      <div className="property-location">
                        <FaMapMarkerAlt />
                        {propiedad.ubicacion}
                      </div>
                    </div>

                    <p className="property-description">
                      {propiedad.descripcion?.substring(0, 100)}...
                    </p>

                    <div className="property-features">
                      {propiedad.dormitorios > 0 && (
                        <div className="feature">
                          <FaBed className="feature-icon" />
                          <span>{propiedad.dormitorios} dorm.</span>
                        </div>
                      )}
                      {propiedad.banos > 0 && (
                        <div className="feature">
                          <FaBath className="feature-icon" />
                          <span>{propiedad.banos} baños</span>
                        </div>
                      )}
                      {propiedad.estacionamientos > 0 && (
                        <div className="feature">
                          <FaCar className="feature-icon" />
                          <span>{propiedad.estacionamientos} est.</span>
                        </div>
                      )}
                      {propiedad.area_total && (
                        <div className="feature">
                          <span>{propiedad.area_total} m²</span>
                        </div>
                      )}
                    </div>

                    <div className="property-footer">
                      <div className="property-price">
                        <div className="price-pen">{formatearPrecio(propiedad.precio)}</div>
                        {propiedad.precio_usd && (
                          <div className="price-usd">{formatearPrecioUSD(propiedad.precio_usd)}</div>
                        )}
                      </div>
                      <button 
                        onClick={() => handleWhatsApp(propiedad)}
                        className="btn btn-whatsapp property-whatsapp"
                        aria-label="Contactar por WhatsApp"
                        title="Contactar por WhatsApp"
                      >
                        <FaWhatsapp size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalogo;