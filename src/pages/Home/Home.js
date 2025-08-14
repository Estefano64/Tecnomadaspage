import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaBed, FaBath, FaCar, FaMapMarkerAlt, FaWhatsapp } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getPropiedades } from '../../services/propiedades';
import { getModalActivo } from '../../services/modal';
import Modal from '../../components/Modal/Modal';
import heroBackground from '../../assets/hero-background.jpg';
import './Home.css';

const Home = () => {
  const [propiedades, setPropiedades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    tipo_propiedad: '',
    precio_max: '',
    dormitorios: '',
    ubicacion: ''
  });
  const [modalConfig, setModalConfig] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  useEffect(() => {
    cargarPropiedadesDestacadas();
    cargarModalConfig();
  }, []);

  const cargarPropiedadesDestacadas = async () => {
    try {
      const result = await getPropiedades();
      if (result.success) {
        // Simulamos propiedades destacadas tomando las primeras 6
        setPropiedades(result.data.slice(0, 6));
      } else {
        toast.error('Error al cargar las propiedades');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar propiedades:', error);
      toast.error('Error al cargar las propiedades');
      setLoading(false);
    }
  };

  const cargarModalConfig = async () => {
    try {
      const result = await getModalActivo();
      if (result.success && result.data) {
        setModalConfig(result.data);
        // Mostrar el modal después de un pequeño delay para que se cargue la página
        setTimeout(() => {
          setMostrarModal(true);
        }, 1000);
      }
    } catch (error) {
      console.error('Error cargando modal:', error);
    }
  };

  const cerrarModal = () => {
    setMostrarModal(false);
  };

  const handleFiltroChange = (e) => {
    setFiltros({
      ...filtros,
      [e.target.name]: e.target.value
    });
  };

  const handleBuscar = () => {
    // Construir URL con parámetros de búsqueda
    const params = new URLSearchParams();
    Object.keys(filtros).forEach(key => {
      if (filtros[key]) {
        params.append(key, filtros[key]);
      }
    });
    
    // Redirigir al catálogo con filtros
    window.location.href = `/catalogo?${params.toString()}`;
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
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div 
          className="hero-background" 
          style={{
            backgroundImage: `linear-gradient(rgba(230, 57, 70, 0.8), rgba(214, 48, 49, 0.8)), url(${heroBackground})`
          }}
        >
          <div className="hero-overlay"></div>
        </div>
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Encuentra tu <span className="highlight">hogar ideal</span> en Arequipa
            </h1>
            <p className="hero-subtitle">
              Descubre las mejores propiedades en venta y alquiler con la confianza de más de 10 años de experiencia en el mercado inmobiliario
            </p>

            {/* Buscador principal */}
            <div className="search-box">
              <div className="search-row">
                <select 
                  name="tipo_propiedad"
                  value={filtros.tipo_propiedad}
                  onChange={handleFiltroChange}
                  className="search-input"
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
                  className="search-input"
                />

                <select 
                  name="dormitorios"
                  value={filtros.dormitorios}
                  onChange={handleFiltroChange}
                  className="search-input"
                >
                  <option value="">Dormitorios</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                </select>

                <select 
                  name="precio_max"
                  value={filtros.precio_max}
                  onChange={handleFiltroChange}
                  className="search-input"
                >
                  <option value="">Precio máximo</option>
                  <option value="150000">S/ 150,000</option>
                  <option value="300000">S/ 300,000</option>
                  <option value="500000">S/ 500,000</option>
                  <option value="1000000">S/ 1,000,000</option>
                </select>

                <button 
                  onClick={handleBuscar}
                  className="search-button"
                  aria-label="Buscar propiedades"
                >
                  <FaSearch />
                  Buscar
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de propiedades destacadas */}
      <section className="featured-properties">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Propiedades Destacadas</h2>
            <p className="section-subtitle">
              Descubre nuestra selección de las mejores propiedades disponibles
            </p>
          </div>

          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="properties-grid">
              {propiedades.map((propiedad) => (
                <div key={propiedad.id} className="property-card">
                  <div className="property-image">
                    <img 
                      src={propiedad.imagenes_propiedades?.[0]?.url_imagen || 'https://via.placeholder.com/300x200?text=Sin+Imagen'}
                      alt={propiedad.titulo}
                      loading="lazy"
                    />
                    <div className="property-badge">Destacada</div>
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
              ))}
            </div>
          )}

          <div className="section-footer">
            <Link to="/catalogo" className="btn btn-primary">
              Ver todas las propiedades
            </Link>
          </div>
        </div>
      </section>

      {/* Sección de servicios */}
      <section className="services">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Nuestros Servicios</h2>
            <p className="section-subtitle">
              Te acompañamos en todo el proceso de compra o venta de tu propiedad
            </p>
          </div>

          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">🏠</div>
              <h3 className="service-title">Venta de Propiedades</h3>
              <p className="service-description">
                Vendemos tu propiedad al mejor precio con estrategias de marketing digital y atención personalizada.
              </p>
            </div>

            <div className="service-card">
              <div className="service-icon">🔑</div>
              <h3 className="service-title">Alquiler</h3>
              <p className="service-description">
                Gestionamos el alquiler de tu propiedad con contratos seguros y inquilinos verificados.
              </p>
            </div>

            <div className="service-card">
              <div className="service-icon">📋</div>
              <h3 className="service-title">Asesoramiento Legal</h3>
              <p className="service-description">
                Te brindamos asesoría legal completa para que tu transacción sea segura y transparente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">¿Listo para encontrar tu próximo hogar?</h2>
            <p className="cta-subtitle">
              Nuestro equipo de expertos está aquí para ayudarte en cada paso del camino
            </p>
            <div className="cta-actions">
              <Link to="/contacto" className="btn btn-primary">
                Contáctanos
              </Link>
              <button 
                onClick={() => handleWhatsApp({ titulo: 'consulta general', precio: '' })}
                className="btn btn-whatsapp"
              >
                <FaWhatsapp size={18} />
                WhatsApp
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Modal personalizable */}
      {modalConfig && (
        <Modal 
          isOpen={mostrarModal} 
          onClose={cerrarModal}
          config={modalConfig}
        />
      )}
    </div>
  );
};

export default Home;