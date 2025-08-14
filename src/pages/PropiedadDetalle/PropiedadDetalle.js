import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaBed, FaBath, FaCar, FaMapMarkerAlt, FaWhatsapp, FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';
import LocationMap from '../../components/LocationMap/LocationMap';
import { getPropiedadById, enviarConsulta } from '../../services/propiedades';
import { enviarEmailConsultaPropiedad, enviarEmailConfirmacion } from '../../services/email';

const PropiedadDetalle = () => {
  const { id } = useParams();
  const [propiedad, setPropiedad] = useState(null);
  const [loading, setLoading] = useState(true);
  const [consultaForm, setConsultaForm] = useState({
    nombre_completo: '',
    telefono: '',
    email: '',
    mensaje: ''
  });
  const [enviandoConsulta, setEnviandoConsulta] = useState(false);

  useEffect(() => {
    cargarPropiedad();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const cargarPropiedad = async () => {
    try {
      const result = await getPropiedadById(id);
      if (result.success) {
        setPropiedad(result.data);
      } else {
        toast.error('Propiedad no encontrada');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar la propiedad');
    }
    setLoading(false);
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

  const handleWhatsApp = () => {
    const phone = "51925803372";
    const message = `Hola, me interesa la propiedad: ${propiedad.titulo} - ${formatearPrecio(propiedad.precio)}`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleConsultaChange = (e) => {
    setConsultaForm({
      ...consultaForm,
      [e.target.name]: e.target.value
    });
  };

  const handleEnviarConsulta = async (e) => {
    e.preventDefault();
    setEnviandoConsulta(true);

    try {
      // 1. Guardar consulta en Supabase
      const resultSupabase = await enviarConsulta({
        ...consultaForm,
        propiedad_id: propiedad.id
      });

      // 2. Enviar email de notificación con información de la propiedad
      const resultEmail = await enviarEmailConsultaPropiedad(consultaForm, propiedad);

      // 3. Enviar email de confirmación al usuario
      if (resultEmail.success) {
        await enviarEmailConfirmacion(consultaForm);
      }

      if (resultSupabase.success) {
        toast.success('¡Consulta enviada exitosamente! Te contactaremos pronto. También hemos enviado una confirmación a tu email.');
        setConsultaForm({
          nombre_completo: '',
          telefono: '',
          email: '',
          mensaje: ''
        });
      } else {
        // Aunque Supabase falle, si el email se envió, consideramos éxito parcial
        if (resultEmail.success) {
          toast.success('Consulta enviada por email. Te contactaremos pronto.');
          setConsultaForm({
            nombre_completo: '',
            telefono: '',
            email: '',
            mensaje: ''
          });
        } else {
          toast.error('Error al enviar consulta');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al enviar consulta');
    }
    setEnviandoConsulta(false);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (!propiedad) {
    return (
      <div className="error-container">
        <h2>Propiedad no encontrada</h2>
        <Link to="/catalogo" className="btn btn-primary">
          <FaArrowLeft /> Volver al catálogo
        </Link>
      </div>
    );
  }

  // Preparar imágenes para la galería
  const images = propiedad.imagenes_propiedades?.map(img => ({
    original: img.url_imagen,
    thumbnail: img.url_imagen
  })) || [{
    original: 'https://via.placeholder.com/800x600?text=Sin+Imagen',
    thumbnail: 'https://via.placeholder.com/150x100?text=Sin+Imagen'
  }];

  return (
    <div className="propiedad-detalle">
      <div className="container">
        {/* Navegación */}
        <div className="breadcrumb">
          <Link to="/">Inicio</Link>
          <span>/</span>
          <Link to="/catalogo">Catálogo</Link>
          <span>/</span>
          <span>{propiedad.titulo}</span>
        </div>

        <div className="detalle-grid">
          {/* Galería de imágenes */}
          <div className="galeria-section">
            <ImageGallery 
              items={images}
              showPlayButton={false}
              showFullscreenButton={true}
              showThumbnails={images.length > 1}
            />
          </div>

          {/* Información de la propiedad */}
          <div className="info-section">
            <div className="propiedad-header">
              <h1>{propiedad.titulo}</h1>
              <div className="location">
                <FaMapMarkerAlt />
                {propiedad.ubicacion}
              </div>
              <div className="price-section">
                <div className="price-main">
                  {formatearPrecio(propiedad.precio)}
                </div>
                {propiedad.precio_usd && (
                  <div className="price-usd">
                    {formatearPrecioUSD(propiedad.precio_usd)}
                  </div>
                )}
              </div>
            </div>

            {/* Características principales */}
            <div className="caracteristicas-principales">
              {propiedad.dormitorios > 0 && (
                <div className="caracteristica">
                  <FaBed className="icon" />
                  <div>
                    <strong>{propiedad.dormitorios}</strong>
                    <span>Dormitorios</span>
                  </div>
                </div>
              )}
              {propiedad.banos > 0 && (
                <div className="caracteristica">
                  <FaBath className="icon" />
                  <div>
                    <strong>{propiedad.banos}</strong>
                    <span>Baños</span>
                  </div>
                </div>
              )}
              {propiedad.estacionamientos > 0 && (
                <div className="caracteristica">
                  <FaCar className="icon" />
                  <div>
                    <strong>{propiedad.estacionamientos}</strong>
                    <span>Estacionamientos</span>
                  </div>
                </div>
              )}
              {propiedad.area_total && (
                <div className="caracteristica">
                  <div>
                    <strong>{propiedad.area_total} m²</strong>
                    <span>Área total</span>
                  </div>
                </div>
              )}
            </div>

            {/* Botones de acción */}
            <div className="acciones">
              <button 
                onClick={handleWhatsApp}
                className="btn btn-whatsapp btn-large"
              >
                <FaWhatsapp />
                Contactar por WhatsApp
              </button>
            </div>
          </div>
        </div>

        {/* Descripción y detalles */}
        <div className="detalles-section">
          <div className="detalles-grid">
            <div className="descripcion">
              <h2>Descripción</h2>
              <p>{propiedad.descripcion}</p>

              {/* Características adicionales */}
              {propiedad.caracteristicas && propiedad.caracteristicas.length > 0 && (
                <div className="caracteristicas-adicionales">
                  <h3>Características adicionales</h3>
                  <ul>
                    {propiedad.caracteristicas.map((caracteristica, index) => (
                      <li key={index}>{caracteristica}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="detalles-especificos">
                <h3>Detalles específicos</h3>
                <div className="detalles-lista">
                  <div className="detalle-item">
                    <span>Tipo:</span>
                    <span>{propiedad.tipo_propiedad}</span>
                  </div>
                  {propiedad.ano_construccion && (
                    <div className="detalle-item">
                      <span>Año de construcción:</span>
                      <span>{propiedad.ano_construccion}</span>
                    </div>
                  )}
                  {propiedad.precio_usd && (
                    <div className="detalle-item">
                      <span>Precio en USD:</span>
                      <span>{formatearPrecioUSD(propiedad.precio_usd)}</span>
                    </div>
                  )}
                  {propiedad.coordenadas && (
                    <div className="detalle-item">
                      <span>Coordenadas:</span>
                      <span>{propiedad.coordenadas.lat.toFixed(6)}, {propiedad.coordenadas.lng.toFixed(6)}</span>
                    </div>
                  )}
                  <div className="detalle-item">
                    <span>Estado:</span>
                    <span>Activa</span>
                  </div>
                  <div className="detalle-item">
                    <span>ID de propiedad:</span>
                    <span>{propiedad.id}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulario de consulta */}
            <div className="consulta-form">
              <h3>Solicitar información</h3>
              <form onSubmit={handleEnviarConsulta}>
                <div className="form-group">
                  <input
                    type="text"
                    name="nombre_completo"
                    placeholder="Nombre completo"
                    value={consultaForm.nombre_completo}
                    onChange={handleConsultaChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="tel"
                    name="telefono"
                    placeholder="Teléfono"
                    value={consultaForm.telefono}
                    onChange={handleConsultaChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={consultaForm.email}
                    onChange={handleConsultaChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <textarea
                    name="mensaje"
                    placeholder="Mensaje (opcional)"
                    rows="4"
                    value={consultaForm.mensaje}
                    onChange={handleConsultaChange}
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  className="btn btn-primary btn-full"
                  disabled={enviandoConsulta}
                >
                  <FaEnvelope />
                  {enviandoConsulta ? 'Enviando...' : 'Enviar consulta'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Sección del mapa */}
        {propiedad.coordenadas && (
          <div className="mapa-section">
            <h2>Ubicación</h2>
            <div className="mapa-container">
              <LocationMap
                initialLocation={{
                  lat: propiedad.coordenadas.lat,
                  lng: propiedad.coordenadas.lng
                }}
                height="400px"
                onLocationSelect={null}
              />
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .propiedad-detalle {
          padding: 2rem 0;
          min-height: calc(100vh - 200px);
        }

        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 2rem;
          color: #666;
        }

        .breadcrumb a {
          color: #007bff;
          text-decoration: none;
        }

        .breadcrumb a:hover {
          text-decoration: underline;
        }

        .detalle-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 3rem;
          margin-bottom: 3rem;
        }

        .galeria-section {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .info-section {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          height: fit-content;
        }

        .propiedad-header h1 {
          font-size: 1.8rem;
          color: #2c3e50;
          margin-bottom: 1rem;
        }

        .location {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #666;
          margin-bottom: 1rem;
        }

        .price-section {
          margin-bottom: 2rem;
        }

        .price-main {
          font-size: 2rem;
          font-weight: 700;
          color: #007bff;
          margin-bottom: 0.5rem;
        }

        .price-usd {
          font-size: 1.5rem;
          font-weight: 600;
          color: #28a745;
          opacity: 0.9;
        }

        .caracteristicas-principales {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .caracteristica {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .caracteristica .icon {
          color: #007bff;
          font-size: 1.25rem;
        }

        .caracteristica strong {
          display: block;
          font-size: 1.25rem;
          color: #2c3e50;
        }

        .caracteristica span {
          font-size: 0.9rem;
          color: #666;
        }

        .acciones {
          margin-top: 2rem;
        }

        .detalles-section {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .detalles-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 3rem;
        }

        .descripcion h2 {
          color: #2c3e50;
          margin-bottom: 1rem;
        }

        .descripcion p {
          line-height: 1.6;
          color: #666;
          margin-bottom: 2rem;
        }

        .caracteristicas-adicionales h3,
        .detalles-especificos h3 {
          color: #2c3e50;
          margin: 2rem 0 1rem 0;
        }

        .caracteristicas-adicionales ul {
          list-style: none;
          padding: 0;
        }

        .caracteristicas-adicionales li {
          padding: 0.5rem 0;
          border-bottom: 1px solid #eee;
        }

        .caracteristicas-adicionales li:before {
          content: "✓";
          color: #007bff;
          margin-right: 0.5rem;
        }

        .detalles-lista {
          display: grid;
          gap: 0.5rem;
        }

        .detalle-item {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem 0;
          border-bottom: 1px solid #eee;
        }

        .detalle-item span:first-child {
          font-weight: 500;
          color: #2c3e50;
        }

        .consulta-form {
          background: #f8f9fa;
          padding: 2rem;
          border-radius: 12px;
        }

        .consulta-form h3 {
          margin-bottom: 1.5rem;
          color: #2c3e50;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 1rem;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 6px;
          font-size: 1rem;
          font-weight: 500;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary {
          background: #007bff;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #0056b3;
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-whatsapp {
          background: #25d366;
          color: white;
        }

        .btn-whatsapp:hover {
          background: #128c7e;
        }

        .btn-large {
          padding: 1rem 2rem;
          font-size: 1.1rem;
          width: 100%;
        }

        .btn-full {
          width: 100%;
        }

        .loading-container,
        .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          text-align: center;
        }

        .loading {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .propiedad-detalle {
            padding: 1rem 0;
          }

          .detalle-grid,
          .detalles-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .caracteristicas-principales {
            grid-template-columns: 1fr;
          }

          .propiedad-header h1 {
            font-size: 1.5rem;
          }

          .price-main {
            font-size: 1.5rem;
          }

          .price-usd {
            font-size: 1.2rem;
          }
        }

        /* Estilos del mapa */
        .mapa-section {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          margin-top: 2rem;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .mapa-section h2 {
          color: #2c3e50;
          margin-bottom: 1.5rem;
          text-align: center;
        }

        .mapa-container {
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
};

export default PropiedadDetalle;