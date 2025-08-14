import React, { useState } from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaWhatsapp, FaClock } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { enviarConsulta } from '../../services/propiedades';
import { enviarEmailContacto, enviarEmailConfirmacion } from '../../services/email';

const Contacto = () => {
  const [formulario, setFormulario] = useState({
    nombre_completo: '',
    telefono: '',
    email: '',
    mensaje: ''
  });
  const [enviando, setEnviando] = useState(false);

  const handleChange = (e) => {
    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);

    try {
      // 1. Guardar consulta en Supabase
      const resultSupabase = await enviarConsulta({
        ...formulario,
        propiedad_id: null // Consulta general
      });

      // 2. Enviar email de notificación
      const resultEmail = await enviarEmailContacto(formulario);

      // 3. Enviar email de confirmación al usuario
      if (resultEmail.success) {
        await enviarEmailConfirmacion(formulario);
      }

      if (resultSupabase.success) {
        toast.success('¡Mensaje enviado exitosamente! Te contactaremos pronto. También hemos enviado una confirmación a tu email.');
        setFormulario({
          nombre_completo: '',
          telefono: '',
          email: '',
          mensaje: ''
        });
      } else {
        // Aunque Supabase falle, si el email se envió, consideramos éxito parcial
        if (resultEmail.success) {
          toast.success('Mensaje enviado por email. Te contactaremos pronto.');
          setFormulario({
            nombre_completo: '',
            telefono: '',
            email: '',
            mensaje: ''
          });
        } else {
          toast.error('Error al enviar el mensaje. Por favor, intenta de nuevo.');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al enviar el mensaje. Por favor, intenta de nuevo.');
    }
    setEnviando(false);
  };

  const handleWhatsApp = () => {
    const phone = "51925803372";
    const message = "Hola, me gustaría recibir información sobre sus servicios inmobiliarios.";
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="contacto">
      <div className="container">
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">Contáctanos</h1>
          <p className="page-subtitle">
            Estamos aquí para ayudarte a encontrar la propiedad perfecta. 
            Contáctanos por cualquiera de nuestros medios disponibles.
          </p>
        </div>

        <div className="contacto-grid">
          {/* Información de contacto */}
          <div className="info-contacto">
            <h2>Información de contacto</h2>
            <p className="intro-text">
              Nuestro equipo de expertos inmobiliarios está listo para asistirte 
              en todo el proceso de compra, venta o alquiler de tu propiedad.
            </p>

            <div className="contacto-items">
              <div className="contacto-item">
                <div className="contacto-icon">
                  <FaPhone />
                </div>
                <div className="contacto-content">
                  <h3>Teléfono</h3>
                  <p>+51 98 765 4321</p>
                  <small>Lunes a Viernes: 9:00 AM - 7:00 PM</small>
                </div>
              </div>

              <div className="contacto-item">
                <div className="contacto-icon">
                  <FaEnvelope />
                </div>
                <div className="contacto-content">
                  <h3>Email</h3>
                  <p>info@tecnomadas.com</p>
                  <small>Te respondemos en menos de 24 horas</small>
                </div>
              </div>

              <div className="contacto-item">
                <div className="contacto-icon">
                  <FaMapMarkerAlt />
                </div>
                <div className="contacto-content">
                  <h3>Oficina</h3>
                  <p>Av. Principal 123, Arequipa</p>
                  <small>Cercado de Arequipa, Perú</small>
                </div>
              </div>

              <div className="contacto-item">
                <div className="contacto-icon">
                  <FaClock />
                </div>
                <div className="contacto-content">
                  <h3>Horarios</h3>
                  <p>Lunes a Viernes: 9:00 AM - 7:00 PM</p>
                  <p>Sábados: 9:00 AM - 2:00 PM</p>
                  <small>Domingos: Cerrado</small>
                </div>
              </div>
            </div>

            {/* WhatsApp destacado */}
            <div className="whatsapp-destacado">
              <h3>¿Necesitas ayuda inmediata?</h3>
              <p>Contáctanos por WhatsApp para una respuesta rápida</p>
              <button 
                onClick={handleWhatsApp}
                className="btn btn-whatsapp btn-large"
              >
                <FaWhatsapp />
                Chatear por WhatsApp
              </button>
            </div>
          </div>

          {/* Formulario de contacto */}
          <div className="formulario-contacto">
            <div className="form-container">
              <h2>Envíanos un mensaje</h2>
              <p>
                Completa el formulario y nos comunicaremos contigo a la brevedad posible.
              </p>

              <form onSubmit={handleSubmit} className="contacto-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="nombre_completo">Nombre completo *</label>
                    <input
                      type="text"
                      id="nombre_completo"
                      name="nombre_completo"
                      value={formulario.nombre_completo}
                      onChange={handleChange}
                      required
                      placeholder="Tu nombre completo"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="telefono">Teléfono *</label>
                    <input
                      type="tel"
                      id="telefono"
                      name="telefono"
                      value={formulario.telefono}
                      onChange={handleChange}
                      required
                      placeholder="+51 123 456 789"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formulario.email}
                      onChange={handleChange}
                      required
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="mensaje">Mensaje *</label>
                  <textarea
                    id="mensaje"
                    name="mensaje"
                    value={formulario.mensaje}
                    onChange={handleChange}
                    required
                    rows="5"
                    placeholder="Cuéntanos cómo podemos ayudarte..."
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary btn-large"
                  disabled={enviando}
                >
                  <FaEnvelope />
                  {enviando ? 'Enviando...' : 'Enviar mensaje'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Mapa o información adicional */}
        <div className="info-adicional">
          <div className="servicios-destacados">
            <h2>¿En qué podemos ayudarte?</h2>
            <div className="servicios-grid">
              <div className="servicio-item">
                <h3>🏠 Compra de propiedades</h3>
                <p>Te ayudamos a encontrar la propiedad perfecta para tu familia con la mejor asesoría.</p>
              </div>
              <div className="servicio-item">
                <h3>💰 Venta de propiedades</h3>
                <p>Vendemos tu propiedad al mejor precio con estrategias de marketing efectivas.</p>
              </div>
              <div className="servicio-item">
                <h3>🔑 Alquiler</h3>
                <p>Gestionamos el alquiler de tu propiedad con contratos seguros y inquilinos verificados.</p>
              </div>
              <div className="servicio-item">
                <h3>📋 Asesoría legal</h3>
                <p>Brindamos asesoramiento legal completo para transacciones seguras y transparentes.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .contacto {
          padding: 2rem 0;
          min-height: calc(100vh - 200px);
        }

        .page-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .page-title {
          font-size: 2.5rem;
          color: #2c3e50;
          margin-bottom: 1rem;
        }

        .page-subtitle {
          color: #666;
          font-size: 1.1rem;
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .contacto-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          margin-bottom: 4rem;
        }

        .info-contacto h2 {
          color: #2c3e50;
          margin-bottom: 1rem;
        }

        .intro-text {
          color: #666;
          line-height: 1.6;
          margin-bottom: 2rem;
        }

        .contacto-items {
          margin-bottom: 3rem;
        }

        .contacto-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .contacto-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 50px;
          height: 50px;
          background: #007bff;
          color: white;
          border-radius: 50%;
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .contacto-content h3 {
          color: #2c3e50;
          margin: 0 0 0.5rem 0;
        }

        .contacto-content p {
          margin: 0 0 0.25rem 0;
          color: #2c3e50;
          font-weight: 500;
        }

        .contacto-content small {
          color: #666;
        }

        .whatsapp-destacado {
          background: #25d366;
          color: white;
          padding: 2rem;
          border-radius: 12px;
          text-align: center;
        }

        .whatsapp-destacado h3 {
          margin: 0 0 0.5rem 0;
        }

        .whatsapp-destacado p {
          margin: 0 0 1.5rem 0;
          opacity: 0.9;
        }

        .form-container {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .form-container h2 {
          color: #2c3e50;
          margin-bottom: 1rem;
        }

        .form-container > p {
          color: #666;
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        .contacto-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-row:first-child {
          grid-template-columns: 1fr;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          margin-bottom: 0.5rem;
          color: #2c3e50;
          font-weight: 500;
        }

        .form-group input,
        .form-group textarea {
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 1rem;
          transition: border-color 0.2s;
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

        .info-adicional {
          background: #f8f9fa;
          padding: 3rem;
          border-radius: 12px;
        }

        .servicios-destacados h2 {
          text-align: center;
          color: #2c3e50;
          margin-bottom: 2rem;
        }

        .servicios-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
        }

        .servicio-item {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .servicio-item h3 {
          color: #2c3e50;
          margin-bottom: 0.5rem;
          font-size: 1.1rem;
        }

        .servicio-item p {
          color: #666;
          line-height: 1.5;
          margin: 0;
        }

        @media (max-width: 768px) {
          .contacto {
            padding: 1rem 0;
          }

          .page-title {
            font-size: 2rem;
          }

          .contacto-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .servicios-grid {
            grid-template-columns: 1fr;
          }

          .info-adicional {
            padding: 2rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Contacto;