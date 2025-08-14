import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUserShield } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { loginAdmin, isAdminLoggedIn } from '../../services/auth';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Redirigir si ya está logueado
  useEffect(() => {
    if (isAdminLoggedIn()) {
      navigate('/admin');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await loginAdmin(formData.email, formData.password);
      
      if (result.success) {
        toast.success('¡Bienvenido al panel de administración!');
        navigate('/admin');
      } else {
        toast.error(result.error || 'Error al iniciar sesión');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al iniciar sesión');
    }
    
    setLoading(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-icon">
              <FaUserShield />
            </div>
            <h1>Panel de Administración</h1>
            <p>Ingresa tus credenciales para acceder</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">
                <FaEnvelope className="input-icon" />
                Correo electrónico
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="admin@tecnomadas.com"
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <FaLock className="input-icon" />
                Contraseña
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? (
                <div className="button-spinner">
                  <div className="spinner"></div>
                  Iniciando sesión...
                </div>
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </form>

          <div className="login-info">
            <div className="demo-credentials">
              <h3>Credenciales de prueba:</h3>
              <p><strong>Email:</strong> admin@tecnomadas.com</p>
              <p><strong>Contraseña:</strong> admin123</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 2rem;
        }

        .login-container {
          width: 100%;
          max-width: 400px;
        }

        .login-card {
          background: white;
          border-radius: 20px;
          padding: 3rem 2rem;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 
                      0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .login-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 50%;
          color: white;
          font-size: 2rem;
          margin-bottom: 1rem;
        }

        .login-header h1 {
          color: #2c3e50;
          margin: 0 0 0.5rem 0;
          font-size: 1.75rem;
        }

        .login-header p {
          color: #666;
          margin: 0;
          font-size: 0.95rem;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          color: #2c3e50;
          font-weight: 500;
          font-size: 0.9rem;
        }

        .input-icon {
          color: #667eea;
          font-size: 0.9rem;
        }

        .form-group input {
          padding: 0.875rem;
          border: 2px solid #e1e5e9;
          border-radius: 10px;
          font-size: 1rem;
          transition: all 0.2s ease;
          background: #fafbfc;
        }

        .form-group input:focus {
          outline: none;
          border-color: #667eea;
          background: white;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .password-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .password-input-wrapper input {
          padding-right: 3rem;
          width: 100%;
        }

        .password-toggle {
          position: absolute;
          right: 1rem;
          background: none;
          border: none;
          color: #666;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 4px;
          transition: color 0.2s;
        }

        .password-toggle:hover {
          color: #667eea;
        }

        .login-button {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          padding: 1rem;
          border-radius: 10px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 0.5rem;
        }

        .login-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }

        .login-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .button-spinner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .login-info {
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid #e1e5e9;
        }

        .demo-credentials {
          background: #f8f9fa;
          padding: 1rem;
          border-radius: 8px;
          text-align: center;
        }

        .demo-credentials h3 {
          color: #2c3e50;
          margin: 0 0 0.5rem 0;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .demo-credentials p {
          color: #666;
          margin: 0.25rem 0;
          font-size: 0.85rem;
          font-family: 'Courier New', monospace;
        }

        @media (max-width: 480px) {
          .login-page {
            padding: 1rem;
          }

          .login-card {
            padding: 2rem 1.5rem;
          }

          .login-header h1 {
            font-size: 1.5rem;
          }

          .login-icon {
            width: 60px;
            height: 60px;
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;