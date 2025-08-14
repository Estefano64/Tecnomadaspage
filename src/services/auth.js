// Servicio de autenticación para el panel de administración
import { supabase } from '../config/supabase';

// Credenciales de administrador (en producción deberían estar en variables de entorno)
const ADMIN_CREDENTIALS = {
  email: 'admin@tecnomadas.com',
  password: 'admin123'
};

// Login del administrador
export const loginAdmin = async (email, password) => {
  try {
    // Verificar credenciales locales
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      // Generar token simple
      const token = btoa(`${email}:${Date.now()}`);
      
      // Guardar en localStorage
      localStorage.setItem('admin_token', token);
      localStorage.setItem('admin_email', email);
      localStorage.setItem('admin_login_time', Date.now().toString());
      
      return { success: true, token };
    } else {
      return { success: false, error: 'Credenciales incorrectas' };
    }
  } catch (error) {
    console.error('Error en login:', error);
    return { success: false, error: 'Error al iniciar sesión' };
  }
};

// Verificar si el admin está logueado
export const isAdminLoggedIn = () => {
  try {
    const token = localStorage.getItem('admin_token');
    const loginTime = localStorage.getItem('admin_login_time');
    
    if (!token || !loginTime) return false;
    
    // Verificar si el token no ha expirado (24 horas)
    const now = Date.now();
    const loginTimestamp = parseInt(loginTime);
    const twentyFourHours = 24 * 60 * 60 * 1000;
    
    if (now - loginTimestamp > twentyFourHours) {
      // Token expirado
      logoutAdmin();
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error verificando login:', error);
    return false;
  }
};

// Obtener información del admin
export const getAdminInfo = () => {
  try {
    const email = localStorage.getItem('admin_email');
    const loginTime = localStorage.getItem('admin_login_time');
    
    return {
      email,
      loginTime: loginTime ? new Date(parseInt(loginTime)) : null
    };
  } catch (error) {
    console.error('Error obteniendo info del admin:', error);
    return null;
  }
};

// Logout del administrador
export const logoutAdmin = () => {
  try {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_email');
    localStorage.removeItem('admin_login_time');
    return { success: true };
  } catch (error) {
    console.error('Error en logout:', error);
    return { success: false, error: 'Error al cerrar sesión' };
  }
};

// Hook para proteger rutas de administración
export const useAdminAuth = () => {
  const isLoggedIn = isAdminLoggedIn();
  const adminInfo = getAdminInfo();
  
  return {
    isLoggedIn,
    adminInfo,
    login: loginAdmin,
    logout: logoutAdmin
  };
};