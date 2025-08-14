import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaPhone, 
  FaWhatsapp, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaFacebook, 
  FaInstagram, 
  FaLinkedin,
  FaClock,
  FaHeart
} from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const handleWhatsApp = () => {
    const phone = "51925803372";
    const message = "Hola, me gustaría obtener más información sobre sus servicios inmobiliarios";
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const horarios = [
    { dia: 'Lunes - Viernes', horario: '9am a 6pm' },
    { dia: 'Sábados', horario: '9am a 4pm' },
    { dia: 'Domingos', horario: '10am a 2pm' }
  ];

  return (
    <footer className="footer">
      <div className="container">
        {/* Sección principal del footer */}
        <div className="footer-main">
          <div className="footer-grid">
            
            {/* Columna 1: Información de la empresa */}
            <div className="footer-section">
              <div className="footer-logo">
                <div className="logo-icon">
                  <span>🏠</span>
                </div>
                <div className="logo-text">
                  <span className="logo-name">TECNOMADAS</span>
                  <span className="logo-subtitle">Tu hogar ideal</span>
                </div>
              </div>
              
              <p className="footer-description">
                Más de 10 años ayudando a familias arequipeñas a encontrar su hogar ideal. 
                Compromiso, confianza y transparencia en cada transacción.
              </p>
              
              <div className="social-links">
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="Síguenos en Facebook"
                  className="social-link"
                >
                  <FaFacebook />
                </a>
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="Síguenos en Instagram"
                  className="social-link"
                >
                  <FaInstagram />
                </a>
                <a 
                  href="https://linkedin.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="Síguenos en LinkedIn"
                  className="social-link"
                >
                  <FaLinkedin />
                </a>
              </div>
            </div>

            {/* Columna 2: Enlaces rápidos */}
            <div className="footer-section">
              <h3 className="footer-title">Enlaces Rápidos</h3>
              <ul className="footer-links">
                <li>
                  <Link to="/" className="footer-link">Inicio</Link>
                </li>
                <li>
                  <Link to="/catalogo" className="footer-link">Catálogo</Link>
                </li>
                <li>
                  <Link to="/catalogo?tipo_propiedad=casa" className="footer-link">Casas</Link>
                </li>
                <li>
                  <Link to="/catalogo?tipo_propiedad=apartamento" className="footer-link">Apartamentos</Link>
                </li>
                <li>
                  <Link to="/catalogo?tipo_propiedad=terreno" className="footer-link">Terrenos</Link>
                </li>
                <li>
                  <Link to="/contacto" className="footer-link">Contacto</Link>
                </li>
              </ul>
            </div>

            {/* Columna 3: Servicios */}
            <div className="footer-section">
              <h3 className="footer-title">Nuestros Servicios</h3>
              <ul className="footer-links">
                <li className="footer-link">Venta de Propiedades</li>
                <li className="footer-link">Alquiler de Inmuebles</li>
                <li className="footer-link">Asesoramiento Legal</li>
                <li className="footer-link">Valuación de Propiedades</li>
                <li className="footer-link">Gestión Inmobiliaria</li>
                <li className="footer-link">Inversión en Bienes Raíces</li>
              </ul>
            </div>

            {/* Columna 4: Contacto y horarios */}
            <div className="footer-section">
              <h3 className="footer-title">Contacto</h3>
              
              <div className="contact-info">
                <div className="contact-item">
                  <FaMapMarkerAlt className="contact-icon" />
                  <div>
                    <p>Av. Ejercito 123, Yanahuara</p>
                    <p>Arequipa, Perú</p>
                  </div>
                </div>
                
                <div className="contact-item">
                  <FaPhone className="contact-icon" />
                  <div>
                    <a href="tel:+51925803372" className="contact-link">
                      +51 987 654 321
                    </a>
                  </div>
                </div>
                
                <div className="contact-item">
                  <FaEnvelope className="contact-icon" />
                  <div>
                    <a href="mailto:info@tecnomadas.com" className="contact-link">
                      info@tecnomadas.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="horarios">
                <h4 className="horarios-title">
                  <FaClock className="horarios-icon" />
                  Horarios de Atención
                </h4>
                <ul className="horarios-list">
                  {horarios.map((item, index) => (
                    <li key={index} className="horario-item">
                      <span className="horario-dia">{item.dia}:</span>
                      <span className="horario-hora">{item.horario}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button 
                onClick={handleWhatsApp}
                className="footer-whatsapp"
                aria-label="Contactar por WhatsApp"
              >
                <FaWhatsapp />
                Escribir por WhatsApp
              </button>
            </div>
          </div>
        </div>

        {/* Sección legal */}
        <div className="footer-legal">
          <div className="legal-content">
            <div className="legal-links">
              <Link to="/terminos" className="legal-link">Términos y Condiciones</Link>
              <Link to="/privacidad" className="legal-link">Política de Privacidad</Link>
              <Link to="/cookies" className="legal-link">Política de Cookies</Link>
            </div>
            
            <div className="copyright">
              <p>
                © {currentYear} Tecnomadas. Todos los derechos reservados. 
                Hecho con <FaHeart className="heart-icon" /> en Arequipa.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Botón flotante de WhatsApp */}
      <button 
        onClick={handleWhatsApp}
        className="whatsapp-float"
        aria-label="Contactar por WhatsApp"
      >
        <FaWhatsapp />
      </button>
    </footer>
  );
};

export default Footer;