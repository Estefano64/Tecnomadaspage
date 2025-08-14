import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaTimes, FaWhatsapp, FaPhone } from 'react-icons/fa';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleWhatsApp = () => {
    const phone = "51925803372"; // Cambia por tu número
    const message = "Hola, me interesa conocer más sobre sus propiedades disponibles";
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <div className="header-content">
          {/* Logo */}
          <Link to="/" className="logo">
            <div className="logo-icon">
              <img 
                src="/logo.png" 
                alt="TECNOMADAS Logo" 
                className="logo-image"
              />
            </div>
            <div className="logo-text">
              <span className="logo-name">TECNOMADAS</span>
              <span className="logo-subtitle">Tu hogar ideal</span>
            </div>
          </Link>

          {/* Navegación Desktop */}
          <nav className="nav-desktop">
            <Link 
              to="/" 
              className={location.pathname === '/' ? 'nav-link active' : 'nav-link'}
            >
              Inicio
            </Link>
            <Link 
              to="/catalogo" 
              className={location.pathname === '/catalogo' ? 'nav-link active' : 'nav-link'}
            >
              Catálogo
            </Link>
            <Link 
              to="/contacto" 
              className={location.pathname === '/contacto' ? 'nav-link active' : 'nav-link'}
            >
              Contacto
            </Link>
          </nav>

          {/* Botones de acción */}
          <div className="header-actions">
            <button 
              className="btn btn-whatsapp header-whatsapp"
              onClick={handleWhatsApp}
              aria-label="Contactar por WhatsApp"
            >
              <FaWhatsapp />
              <span className="btn-text">WhatsApp</span>
            </button>

            <a 
              href="tel:+51925803372" 
              className="btn btn-outline header-phone"
              aria-label="Llamar por teléfono"
            >
              <FaPhone />
              <span className="btn-text">Llamar</span>
            </a>

            {/* Botón menú móvil */}
            <button 
              className="menu-toggle"
              onClick={toggleMenu}
              aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>

        {/* Navegación Móvil */}
        <nav className={`nav-mobile ${isMenuOpen ? 'open' : ''}`}>
          <Link 
            to="/" 
            className={location.pathname === '/' ? 'nav-link active' : 'nav-link'}
          >
            Inicio
          </Link>
          <Link 
            to="/catalogo" 
            className={location.pathname === '/catalogo' ? 'nav-link active' : 'nav-link'}
          >
            Catálogo
          </Link>
          <Link 
            to="/contacto" 
            className={location.pathname === '/contacto' ? 'nav-link active' : 'nav-link'}
          >
            Contacto
          </Link>
          
          <div className="nav-mobile-actions">
            <button 
              className="btn btn-whatsapp"
              onClick={handleWhatsApp}
            >
              <FaWhatsapp />
              WhatsApp
            </button>
            <a 
              href="tel:+51925803372" 
              className="btn btn-outline"
            >
              <FaPhone />
              Llamar
            </a>
          </div>
        </nav>
      </div>

      {/* Overlay para cerrar menú móvil */}
      {isMenuOpen && (
        <div 
          className="menu-overlay"
          onClick={toggleMenu}
          aria-hidden="true"
        />
      )}
    </header>
  );
};

export default Header;