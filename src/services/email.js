import emailjs from '@emailjs/browser';

// Configuración de EmailJS
const EMAILJS_CONFIG = {
  serviceId: process.env.REACT_APP_EMAILJS_SERVICE_ID,
  templateId: process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
  publicKey: process.env.REACT_APP_EMAILJS_PUBLIC_KEY
};

// Inicializar EmailJS
emailjs.init(EMAILJS_CONFIG.publicKey);

// Función para enviar email de contacto
export const enviarEmailContacto = async (formData) => {
  try {
    // Verificar que las variables de entorno estén configuradas
    if (!EMAILJS_CONFIG.serviceId || !EMAILJS_CONFIG.templateId || !EMAILJS_CONFIG.publicKey) {
      console.warn('EmailJS no está configurado. Simulando envío de email...');
      
      // Simular envío exitoso para desarrollo
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ success: true, message: 'Email simulado enviado correctamente' });
        }, 1000);
      });
    }

    // Preparar los datos para el template de EmailJS
    const templateParams = {
      from_name: formData.nombre_completo,
      from_email: formData.email,
      phone: formData.telefono,
      message: formData.mensaje,
      to_name: 'Equipo Tecnomadas',
      reply_to: formData.email,
      // Agregar información adicional si hay propiedad específica
      property_id: formData.propiedad_id || 'Consulta general'
    };

    // Enviar email usando EmailJS
    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      templateParams
    );

    if (response.status === 200) {
      return { success: true, message: 'Email enviado correctamente' };
    } else {
      throw new Error('Error al enviar email');
    }

  } catch (error) {
    console.error('Error enviando email:', error);
    return { 
      success: false, 
      error: error.message || 'Error al enviar email' 
    };
  }
};

// Función para enviar email de nueva consulta desde el detalle de propiedad
export const enviarEmailConsultaPropiedad = async (consultaData, propiedadInfo) => {
  try {
    if (!EMAILJS_CONFIG.serviceId || !EMAILJS_CONFIG.templateId || !EMAILJS_CONFIG.publicKey) {
      console.warn('EmailJS no está configurado. Simulando envío de email...');
      return { success: true, message: 'Email simulado enviado correctamente' };
    }

    const templateParams = {
      from_name: consultaData.nombre_completo,
      from_email: consultaData.email,
      phone: consultaData.telefono,
      message: consultaData.mensaje || `Estoy interesado en la propiedad: ${propiedadInfo?.titulo}`,
      property_title: propiedadInfo?.titulo || 'Propiedad no especificada',
      property_price: propiedadInfo?.precio ? `S/ ${propiedadInfo.precio.toLocaleString()}` : '',
      property_location: propiedadInfo?.ubicacion || '',
      to_name: 'Equipo Tecnomadas',
      reply_to: consultaData.email
    };

    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      'template_property_inquiry', // Template específico para consultas de propiedades
      templateParams
    );

    if (response.status === 200) {
      return { success: true, message: 'Consulta enviada correctamente' };
    } else {
      throw new Error('Error al enviar consulta');
    }

  } catch (error) {
    console.error('Error enviando consulta:', error);
    return { 
      success: false, 
      error: error.message || 'Error al enviar consulta' 
    };
  }
};

// Función para enviar email de confirmación al usuario
export const enviarEmailConfirmacion = async (userData) => {
  try {
    if (!EMAILJS_CONFIG.serviceId || !EMAILJS_CONFIG.publicKey) {
      return { success: true, message: 'Confirmación simulada' };
    }

    const templateParams = {
      to_name: userData.nombre_completo,
      to_email: userData.email,
      message: 'Gracias por contactarnos. Hemos recibido tu consulta y te responderemos a la brevedad.'
    };

    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      'template_confirmation', // Template de confirmación
      templateParams
    );

    return { success: response.status === 200 };

  } catch (error) {
    console.error('Error enviando confirmación:', error);
    return { success: false };
  }
};

// Función para validar la configuración de EmailJS
export const validateEmailJSConfig = () => {
  const isConfigured = !!(
    EMAILJS_CONFIG.serviceId && 
    EMAILJS_CONFIG.templateId && 
    EMAILJS_CONFIG.publicKey
  );
  
  return {
    isConfigured,
    missing: {
      serviceId: !EMAILJS_CONFIG.serviceId,
      templateId: !EMAILJS_CONFIG.templateId,
      publicKey: !EMAILJS_CONFIG.publicKey
    }
  };
};