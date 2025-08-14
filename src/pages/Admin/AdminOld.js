import React, { useState, useEffect } from 'react';
import { FaPlus, FaImage, FaTrash, FaEdit, FaEye, FaSignOutAlt, FaHome, FaUsers, FaEnvelope, FaCog } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { crearPropiedad, getPropiedades } from '../../services/propiedades';
import { logoutAdmin, getAdminInfo } from '../../services/auth';

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [adminInfo, setAdminInfo] = useState(null);
  const [propiedades, setPropiedades] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [formulario, setFormulario] = useState({
    titulo: '',
    descripcion: '',
    precio: '',
    tipo_propiedad: '',
    ubicacion: '',
    area_total: '',
    dormitorios: '',
    banos: '',
    estacionamientos: '',
    ano_construccion: '',
    caracteristicas: []
  });
  const [imagenes, setImagenes] = useState([]);
  const [previewImagenes, setPreviewImagenes] = useState([]);
  const [nuevaCaracteristica, setNuevaCaracteristica] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const info = getAdminInfo();
    setAdminInfo(info);
    cargarPropiedades();
  }, []);

  const cargarPropiedades = async () => {
    setLoading(true);
    try {
      const result = await getPropiedades();
      if (result.success) {
        setPropiedades(result.data);
      }
    } catch (error) {
      console.error('Error cargando propiedades:', error);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    logoutAdmin();
    toast.success('Sesión cerrada correctamente');
    navigate('/login');
  };

  const handleChange = (e) => {
    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value
    });
  };

  const handleImagenesChange = (e) => {
    const files = Array.from(e.target.files);
    setImagenes(files);

    // Crear previews
    const previews = files.map(file => URL.createObjectURL(file));
    setPreviewImagenes(previews);
  };

  const eliminarImagen = (index) => {
    const nuevasImagenes = imagenes.filter((_, i) => i !== index);
    const nuevasPreviews = previewImagenes.filter((_, i) => i !== index);
    
    setImagenes(nuevasImagenes);
    setPreviewImagenes(nuevasPreviews);
  };

  const agregarCaracteristica = () => {
    if (nuevaCaracteristica.trim()) {
      setFormulario({
        ...formulario,
        caracteristicas: [...formulario.caracteristicas, nuevaCaracteristica.trim()]
      });
      setNuevaCaracteristica('');
    }
  };

  const eliminarCaracteristica = (index) => {
    const nuevasCaracteristicas = formulario.caracteristicas.filter((_, i) => i !== index);
    setFormulario({
      ...formulario,
      caracteristicas: nuevasCaracteristicas
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);

    try {
      const result = await crearPropiedad(formulario, imagenes);
      
      if (result.success) {
        toast.success('Propiedad creada exitosamente');
        // Limpiar formulario
        setFormulario({
          titulo: '',
          descripcion: '',
          precio: '',
          tipo_propiedad: '',
          ubicacion: '',
          area_total: '',
          dormitorios: '',
          banos: '',
          estacionamientos: '',
          ano_construccion: '',
          caracteristicas: []
        });
        setImagenes([]);
        setPreviewImagenes([]);
        setNuevaCaracteristica('');
      } else {
        toast.error('Error al crear la propiedad');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al crear la propiedad');
    }
    setGuardando(false);
  };

  // Renderizar dashboard
  const renderDashboard = () => (
    <div className="dashboard">
      <div className="stats-grid">
        <div className="stat-card">
          <FaHome className="stat-icon" />
          <div className="stat-content">
            <h3>{propiedades.length}</h3>
            <p>Propiedades totales</p>
          </div>
        </div>
        <div className="stat-card">
          <FaEye className="stat-icon" />
          <div className="stat-content">
            <h3>{propiedades.filter(p => p.activa).length}</h3>
            <p>Propiedades activas</p>
          </div>
        </div>
      </div>

      <div className="recent-properties">
        <h3>Propiedades recientes</h3>
        <div className="properties-table">
          {loading ? (
            <div className="loading">Cargando...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Precio</th>
                  <th>Ubicación</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {propiedades.slice(0, 5).map(prop => (
                  <tr key={prop.id}>
                    <td>{prop.titulo}</td>
                    <td>S/ {prop.precio?.toLocaleString()}</td>
                    <td>{prop.ubicacion}</td>
                    <td>
                      <span className={`status ${prop.activa ? 'active' : 'inactive'}`}>
                        {prop.activa ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td>
                      <button className="btn-icon" title="Editar">
                        <FaEdit />
                      </button>
                      <button className="btn-icon" title="Ver">
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="admin">
      {/* Header */}
      <div className="admin-header">
        <div className="header-left">
          <h1>Panel de Administración</h1>
          <p>Gestiona tu sitio inmobiliario</p>
        </div>
        <div className="header-right">
          <div className="admin-info">
            <span>Bienvenido, {adminInfo?.email}</span>
            <button onClick={handleLogout} className="logout-btn">
              <FaSignOutAlt /> Cerrar sesión
            </button>
          </div>
        </div>
      </div>

      <div className="admin-layout">
        {/* Sidebar */}
        <div className="admin-sidebar">
          <nav className="sidebar-nav">
            <button 
              className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <FaHome /> Dashboard
            </button>
            <button 
              className={`nav-item ${activeTab === 'crear' ? 'active' : ''}`}
              onClick={() => setActiveTab('crear')}
            >
              <FaPlus /> Crear propiedad
            </button>
            <button 
              className={`nav-item ${activeTab === 'propiedades' ? 'active' : ''}`}
              onClick={() => setActiveTab('propiedades')}
            >
              <FaHome /> Propiedades
            </button>
            <button 
              className={`nav-item ${activeTab === 'consultas' ? 'active' : ''}`}
              onClick={() => setActiveTab('consultas')}
            >
              <FaEnvelope /> Consultas
            </button>
          </nav>
        </div>

        {/* Main content */}
        <div className="admin-main">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'crear' && (
            <div className="crear-propiedad">
              <h2>Crear nueva propiedad</h2>

        <div className="admin-content">
          <form onSubmit={handleSubmit} className="propiedad-form">
            {/* Información básica */}
            <div className="form-section">
              <h2>Información básica</h2>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="titulo">Título de la propiedad *</label>
                  <input
                    type="text"
                    id="titulo"
                    name="titulo"
                    value={formulario.titulo}
                    onChange={handleChange}
                    required
                    placeholder="Ej: Casa moderna de 3 dormitorios"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="tipo_propiedad">Tipo de propiedad *</label>
                  <select
                    id="tipo_propiedad"
                    name="tipo_propiedad"
                    value={formulario.tipo_propiedad}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccionar tipo</option>
                    <option value="casa">Casa</option>
                    <option value="apartamento">Apartamento</option>
                    <option value="departamento">Departamento</option>
                    <option value="local">Local comercial</option>
                    <option value="terreno">Terreno</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="precio">Precio (S/) *</label>
                  <input
                    type="number"
                    id="precio"
                    name="precio"
                    value={formulario.precio}
                    onChange={handleChange}
                    required
                    placeholder="250000"
                    min="0"
                    step="1000"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="ubicacion">Ubicación *</label>
                <input
                  type="text"
                  id="ubicacion"
                  name="ubicacion"
                  value={formulario.ubicacion}
                  onChange={handleChange}
                  required
                  placeholder="Ej: Cercado, Arequipa"
                />
              </div>

              <div className="form-group">
                <label htmlFor="descripcion">Descripción *</label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={formulario.descripcion}
                  onChange={handleChange}
                  required
                  rows="4"
                  placeholder="Describe la propiedad, sus características y beneficios..."
                ></textarea>
              </div>
            </div>

            {/* Detalles técnicos */}
            <div className="form-section">
              <h2>Detalles técnicos</h2>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="area_total">Área total (m²)</label>
                  <input
                    type="number"
                    id="area_total"
                    name="area_total"
                    value={formulario.area_total}
                    onChange={handleChange}
                    placeholder="120"
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="dormitorios">Dormitorios</label>
                  <select
                    id="dormitorios"
                    name="dormitorios"
                    value={formulario.dormitorios}
                    onChange={handleChange}
                  >
                    <option value="">Seleccionar</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5+</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="banos">Baños</label>
                  <select
                    id="banos"
                    name="banos"
                    value={formulario.banos}
                    onChange={handleChange}
                  >
                    <option value="">Seleccionar</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5+</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="estacionamientos">Estacionamientos</label>
                  <select
                    id="estacionamientos"
                    name="estacionamientos"
                    value={formulario.estacionamientos}
                    onChange={handleChange}
                  >
                    <option value="">Seleccionar</option>
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4+</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="ano_construccion">Año de construcción</label>
                  <input
                    type="number"
                    id="ano_construccion"
                    name="ano_construccion"
                    value={formulario.ano_construccion}
                    onChange={handleChange}
                    placeholder="2020"
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                </div>
              </div>
            </div>

            {/* Características adicionales */}
            <div className="form-section">
              <h2>Características adicionales</h2>
              
              <div className="caracteristicas-input">
                <input
                  type="text"
                  value={nuevaCaracteristica}
                  onChange={(e) => setNuevaCaracteristica(e.target.value)}
                  placeholder="Ej: Piscina, Jardín, Balcón..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), agregarCaracteristica())}
                />
                <button 
                  type="button"
                  onClick={agregarCaracteristica}
                  className="btn btn-secondary"
                >
                  <FaPlus /> Agregar
                </button>
              </div>

              {formulario.caracteristicas.length > 0 && (
                <div className="caracteristicas-lista">
                  {formulario.caracteristicas.map((caracteristica, index) => (
                    <div key={index} className="caracteristica-item">
                      <span>{caracteristica}</span>
                      <button
                        type="button"
                        onClick={() => eliminarCaracteristica(index)}
                        className="btn-eliminar"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Imágenes */}
            <div className="form-section">
              <h2>Imágenes</h2>
              
              <div className="imagenes-input">
                <label htmlFor="imagenes" className="file-input-label">
                  <FaImage />
                  Seleccionar imágenes
                  <input
                    type="file"
                    id="imagenes"
                    multiple
                    accept="image/*"
                    onChange={handleImagenesChange}
                    style={{ display: 'none' }}
                  />
                </label>
                <small>Selecciona múltiples imágenes. La primera será la imagen principal.</small>
              </div>

              {previewImagenes.length > 0 && (
                <div className="imagenes-preview">
                  {previewImagenes.map((preview, index) => (
                    <div key={index} className="imagen-preview">
                      <img src={preview} alt={`Preview ${index + 1}`} />
                      {index === 0 && <div className="imagen-principal">Principal</div>}
                      <button
                        type="button"
                        onClick={() => eliminarImagen(index)}
                        className="btn-eliminar-imagen"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="form-actions">
              <button 
                type="submit" 
                className="btn btn-primary btn-large"
                disabled={guardando}
              >
                {guardando ? 'Guardando...' : 'Crear propiedad'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        .admin {
          padding: 2rem 0;
          min-height: calc(100vh - 200px);
          background: #f8f9fa;
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
        }

        .admin-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .propiedad-form {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .form-section {
          margin-bottom: 3rem;
        }

        .form-section:last-of-type {
          margin-bottom: 2rem;
        }

        .form-section h2 {
          color: #2c3e50;
          margin-bottom: 1.5rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #007bff;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .form-row:has(.form-group:only-child) {
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
        .form-group select,
        .form-group textarea {
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 1rem;
          transition: border-color 0.2s;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
        }

        .caracteristicas-input {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .caracteristicas-input input {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 1rem;
        }

        .caracteristicas-lista {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .caracteristica-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #e3f2fd;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.9rem;
        }

        .btn-eliminar {
          background: none;
          border: none;
          color: #dc3545;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-eliminar:hover {
          background: #dc3545;
          color: white;
        }

        .imagenes-input {
          margin-bottom: 1rem;
        }

        .file-input-label {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: #007bff;
          color: white;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .file-input-label:hover {
          background: #0056b3;
        }

        .imagenes-input small {
          display: block;
          margin-top: 0.5rem;
          color: #666;
        }

        .imagenes-preview {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 1rem;
        }

        .imagen-preview {
          position: relative;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .imagen-preview img {
          width: 100%;
          height: 120px;
          object-fit: cover;
        }

        .imagen-principal {
          position: absolute;
          top: 0.5rem;
          left: 0.5rem;
          background: #28a745;
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.8rem;
        }

        .btn-eliminar-imagen {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          background: rgba(220, 53, 69, 0.9);
          color: white;
          border: none;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-eliminar-imagen:hover {
          background: #dc3545;
        }

        .form-actions {
          padding-top: 2rem;
          border-top: 1px solid #eee;
          text-align: center;
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

        .btn-secondary {
          background: #6c757d;
          color: white;
        }

        .btn-secondary:hover {
          background: #545b62;
        }

        .btn-large {
          padding: 1rem 2rem;
          font-size: 1.1rem;
          min-width: 200px;
        }

        @media (max-width: 768px) {
          .admin {
            padding: 1rem 0;
          }

          .page-title {
            font-size: 2rem;
          }

          .propiedad-form {
            padding: 1.5rem;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .caracteristicas-input {
            flex-direction: column;
          }

          .imagenes-preview {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

export default Admin;