import React, { useState, useEffect } from 'react';
import { FaPlus, FaImage, FaTrash, FaEdit, FaEye, FaSignOutAlt, FaHome, FaEnvelope, FaWindowRestore, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { crearPropiedad, getPropiedadesAdmin, actualizarPropiedad, eliminarPropiedad, getConsultas } from '../../services/propiedades';
import { logoutAdmin, getAdminInfo } from '../../services/auth';
import { getAllModales, crearModal, actualizarModal, eliminarModal, toggleModalActivo } from '../../services/modal';
import LocationMap from '../../components/LocationMap/LocationMap';

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [adminInfo, setAdminInfo] = useState(null);
  const [propiedades, setPropiedades] = useState([]);
  const [consultas, setConsultas] = useState([]);
  const [modales, setModales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [editandoModalId, setEditandoModalId] = useState(null);
  
  const [formulario, setFormulario] = useState({
    titulo: '',
    descripcion: '',
    precio: '',
    precio_usd: '',
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
  const [ubicacionMapa, setUbicacionMapa] = useState(null);
  
  const [formularioModal, setFormularioModal] = useState({
    titulo: '',
    contenido: '',
    imagen_url: '',
    color_fondo: '#ffffff',
    color_texto: '#000000',
    tamaño: 'mediano',
    activo: false
  });
  const [guardandoModal, setGuardandoModal] = useState(false);
  const [imagenModal, setImagenModal] = useState(null);
  const [previewImagenModal, setPreviewImagenModal] = useState('');

  useEffect(() => {
    const info = getAdminInfo();
    setAdminInfo(info);
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      // Cargar propiedades para admin (incluye inactivas)
      const propResult = await getPropiedadesAdmin();
      if (propResult.success) {
        setPropiedades(propResult.data);
      }
      
      // Cargar consultas
      const consultaResult = await getConsultas();
      if (consultaResult.success) {
        setConsultas(consultaResult.data);
      }

      // Cargar modales
      const modalResult = await getAllModales();
      if (modalResult.success) {
        setModales(modalResult.data);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
    setLoading(false);
  };

  const cargarPropiedades = async () => {
    try {
      const result = await getPropiedadesAdmin();
      if (result.success) {
        setPropiedades(result.data);
      }
    } catch (error) {
      console.error('Error cargando propiedades:', error);
    }
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
    
    // Limitar a máximo 6 imágenes
    const maxFiles = files.slice(0, 6);
    setImagenes(maxFiles);

    // Crear previews con información adicional
    const previews = maxFiles.map((file, index) => ({
      url: URL.createObjectURL(file),
      file: file,
      name: file.name,
      order: index
    }));
    setPreviewImagenes(previews);
  };

  const reorderImages = (dragIndex, dropIndex) => {
    const newImagenes = [...imagenes];
    const newPreviews = [...previewImagenes];
    
    // Intercambiar elementos
    [newImagenes[dragIndex], newImagenes[dropIndex]] = [newImagenes[dropIndex], newImagenes[dragIndex]];
    [newPreviews[dragIndex], newPreviews[dropIndex]] = [newPreviews[dropIndex], newPreviews[dragIndex]];
    
    // Actualizar orden
    newPreviews.forEach((preview, index) => {
      preview.order = index;
    });
    
    setImagenes(newImagenes);
    setPreviewImagenes(newPreviews);
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

  const handleLocationSelect = (location) => {
    setUbicacionMapa(location);
    // Opcionalmente puedes también actualizar el campo de ubicación del formulario
    // con las coordenadas o hacer una geocodificación inversa para obtener la dirección
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);

    try {
      // Validar campos requeridos
      if (!formulario.titulo || !formulario.descripcion || !formulario.precio || !formulario.tipo_propiedad || !formulario.ubicacion) {
        toast.error('Por favor completa todos los campos requeridos');
        setGuardando(false);
        return;
      }

      // Agregar coordenadas del mapa al formulario
      const propiedadData = {
        ...formulario,
        coordenadas: ubicacionMapa ? {
          lat: ubicacionMapa.lat,
          lng: ubicacionMapa.lng
        } : null
      };

      console.log('Enviando datos de propiedad:', propiedadData);
      console.log('Imágenes a procesar:', imagenes.length);
      
      // Debug: verificar longitud de campos de texto
      console.log('Longitud de título:', propiedadData.titulo?.length);
      console.log('Longitud de descripción:', propiedadData.descripcion?.length);
      console.log('Longitud de ubicación:', propiedadData.ubicacion?.length);
      console.log('Características:', propiedadData.caracteristicas);

      let result;
      if (editandoId) {
        // Actualizar propiedad existente
        console.log('Actualizando propiedad con ID:', editandoId);
        result = await actualizarPropiedad(editandoId, propiedadData, imagenes.length > 0 ? imagenes : null);
        console.log('Resultado actualización:', result);
        if (result.success) {
          toast.success('Propiedad actualizada exitosamente');
        }
      } else {
        // Crear nueva propiedad
        console.log('Creando nueva propiedad');
        result = await crearPropiedad(propiedadData, imagenes);
        console.log('Resultado creación:', result);
        if (result.success) {
          toast.success('Propiedad creada exitosamente');
        }
      }
      
      if (result.success) {
        limpiarFormulario();
        cargarPropiedades();
        setActiveTab('propiedades');
      } else {
        console.error('Error en operación:', result.error);
        toast.error(result.error || (editandoId ? 'Error al actualizar la propiedad' : 'Error al crear la propiedad'));
      }
    } catch (error) {
      console.error('Error en handleSubmit:', error);
      toast.error(editandoId ? 'Error al actualizar la propiedad' : 'Error al crear la propiedad');
    }
    setGuardando(false);
  };

  const limpiarFormulario = () => {
    setFormulario({
      titulo: '',
      descripcion: '',
      precio: '',
      precio_usd: '',
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
    setUbicacionMapa(null);
    setEditandoId(null);
  };

  const handleEditarPropiedad = (propiedad) => {
    setFormulario({
      titulo: propiedad.titulo || '',
      descripcion: propiedad.descripcion || '',
      precio: propiedad.precio?.toString() || '',
      precio_usd: propiedad.precio_usd?.toString() || '',
      tipo_propiedad: propiedad.tipo_propiedad || '',
      ubicacion: propiedad.ubicacion || '',
      area_total: propiedad.area_total?.toString() || '',
      dormitorios: propiedad.dormitorios?.toString() || '',
      banos: propiedad.banos?.toString() || '',
      estacionamientos: propiedad.estacionamientos?.toString() || '',
      ano_construccion: propiedad.ano_construccion?.toString() || '',
      caracteristicas: propiedad.caracteristicas || []
    });
    
    // Establecer ubicación del mapa si existe
    if (propiedad.coordenadas) {
      setUbicacionMapa({
        lat: propiedad.coordenadas.lat,
        lng: propiedad.coordenadas.lng
      });
    }
    
    setEditandoId(propiedad.id);
    setActiveTab('crear');
  };

  const handleEliminarPropiedad = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta propiedad?')) {
      try {
        const result = await eliminarPropiedad(id);
        if (result.success) {
          toast.success('Propiedad eliminada exitosamente');
          cargarPropiedades();
        } else {
          toast.error('Error al eliminar la propiedad');
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error('Error al eliminar la propiedad');
      }
    }
  };

  const handleVerPropiedad = (id) => {
    window.open(`/propiedad/${id}`, '_blank');
  };

  // Funciones para manejar modales
  const handleModalChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormularioModal({
      ...formularioModal,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleImagenModalChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagenModal(file);
      const preview = URL.createObjectURL(file);
      setPreviewImagenModal(preview);
    }
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setGuardandoModal(true);

    try {
      let modalData = { ...formularioModal };

      // Procesar imagen si hay una nueva
      if (imagenModal) {
        const { procesarImagen } = await import('../../services/propiedades');
        const resultImagen = await procesarImagen(imagenModal, 'modal-' + Date.now());
        if (resultImagen.success) {
          modalData.imagen_url = resultImagen.url;
        }
      }

      let result;
      if (editandoModalId) {
        result = await actualizarModal(editandoModalId, modalData);
        if (result.success) {
          toast.success('Modal actualizado exitosamente');
        }
      } else {
        result = await crearModal(modalData);
        if (result.success) {
          toast.success('Modal creado exitosamente');
        }
      }
      
      if (result.success) {
        limpiarFormularioModal();
        cargarDatos();
        setActiveTab('modales');
      } else {
        toast.error(editandoModalId ? 'Error al actualizar el modal' : 'Error al crear el modal');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(editandoModalId ? 'Error al actualizar el modal' : 'Error al crear el modal');
    }
    setGuardandoModal(false);
  };

  const limpiarFormularioModal = () => {
    setFormularioModal({
      titulo: '',
      contenido: '',
      imagen_url: '',
      color_fondo: '#ffffff',
      color_texto: '#000000',
      tamaño: 'mediano',
      activo: false
    });
    setEditandoModalId(null);
    setImagenModal(null);
    setPreviewImagenModal('');
  };

  const handleEditarModal = (modal) => {
    setFormularioModal({
      titulo: modal.titulo || '',
      contenido: modal.contenido || '',
      imagen_url: modal.imagen_url || '',
      color_fondo: modal.color_fondo || '#ffffff',
      color_texto: modal.color_texto || '#000000',
      tamaño: modal.tamaño || 'mediano',
      activo: modal.activo || false
    });
    setPreviewImagenModal(modal.imagen_url || '');
    setEditandoModalId(modal.id);
    setActiveTab('crear-modal');
  };

  const handleEliminarModal = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este modal?')) {
      try {
        const result = await eliminarModal(id);
        if (result.success) {
          toast.success('Modal eliminado exitosamente');
          cargarDatos();
        } else {
          toast.error('Error al eliminar el modal');
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error('Error al eliminar el modal');
      }
    }
  };

  const handleToggleModal = async (id, activo) => {
    try {
      const result = await toggleModalActivo(id, activo);
      if (result.success) {
        toast.success(activo ? 'Modal activado' : 'Modal desactivado');
        cargarDatos();
      } else {
        toast.error('Error al cambiar estado del modal');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cambiar estado del modal');
    }
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
        <div className="properties-table-container">
          {loading ? (
            <div className="loading-center">
              <div className="spinner"></div>
              <p>Cargando propiedades...</p>
            </div>
          ) : propiedades.length === 0 ? (
            <div className="empty-state">
              <FaHome size={48} color="#ccc" />
              <h3>No hay propiedades</h3>
              <p>Comienza creando tu primera propiedad</p>
              <button 
                onClick={() => setActiveTab('crear')}
                className="btn btn-primary"
              >
                <FaPlus /> Crear propiedad
              </button>
            </div>
          ) : (
            <div className="properties-table">
              <table>
                <thead>
                  <tr>
                    <th>Imagen</th>
                    <th>Título</th>
                    <th>Precio</th>
                    <th>Ubicación</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {propiedades.slice(0, 10).map(prop => (
                    <tr key={prop.id}>
                      <td>
                        <div className="property-thumb">
                          <img 
                            src={prop.imagenes_propiedades?.[0]?.url_imagen || 'https://via.placeholder.com/60x40?text=Sin+Imagen'}
                            alt={prop.titulo}
                          />
                        </div>
                      </td>
                      <td>
                        <div className="property-title">
                          <strong>{prop.titulo}</strong>
                          <small>{prop.tipo_propiedad}</small>
                        </div>
                      </td>
                      <td><strong>S/ {prop.precio?.toLocaleString()}</strong></td>
                      <td>{prop.ubicacion}</td>
                      <td>
                        <span className={`status ${prop.activa ? 'active' : 'inactive'}`}>
                          {prop.activa ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn-icon edit" 
                            title="Editar"
                            onClick={() => handleEditarPropiedad(prop)}
                          >
                            <FaEdit />
                          </button>
                          <button 
                            className="btn-icon view" 
                            title="Ver"
                            onClick={() => handleVerPropiedad(prop.id)}
                          >
                            <FaEye />
                          </button>
                          <button 
                            className="btn-icon delete" 
                            title="Eliminar"
                            onClick={() => handleEliminarPropiedad(prop.id)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Renderizar formulario de crear/editar propiedad
  const renderCrearPropiedad = () => (
    <div className="crear-propiedad">
      <div className="section-header">
        <h2>{editandoId ? 'Editar propiedad' : 'Crear nueva propiedad'}</h2>
        <p>{editandoId ? 'Modifica la información de la propiedad' : 'Completa la información para agregar una nueva propiedad'}</p>
        {editandoId && (
          <button onClick={limpiarFormulario} className="btn btn-secondary">
            Cancelar edición
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="propiedad-form">
        {/* Información básica */}
        <div className="form-section">
          <h3>Información básica</h3>
          
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

            <div className="form-group">
              <label htmlFor="precio_usd">Precio en USD (opcional)</label>
              <input
                type="number"
                id="precio_usd"
                name="precio_usd"
                value={formulario.precio_usd}
                onChange={handleChange}
                placeholder="65000"
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
            <small>Escribe la dirección y luego selecciona la ubicación exacta en el mapa</small>
          </div>

          <div className="form-group">
            <label>Seleccionar ubicación en el mapa</label>
            <LocationMap 
              onLocationSelect={handleLocationSelect}
              initialLocation={ubicacionMapa}
              height="300px"
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
          <h3>Detalles técnicos</h3>
          
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
          <h3>Características adicionales</h3>
          
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
          <h3>Imágenes (máximo 6)</h3>
          
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
            <small>
              Selecciona hasta 6 imágenes. La primera será la imagen principal/miniatura.
              Puedes arrastrar las imágenes para cambiar su orden.
            </small>
          </div>

          {previewImagenes.length > 0 && (
            <div className="imagenes-preview">
              <div className="imagenes-info">
                <p><strong>Orden de imágenes:</strong> Arrastra para reordenar. La primera imagen se usará como miniatura.</p>
              </div>
              {previewImagenes.map((preview, index) => (
                <div 
                  key={index} 
                  className="imagen-preview"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('dragIndex', index);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const dragIndex = parseInt(e.dataTransfer.getData('dragIndex'));
                    if (dragIndex !== index) {
                      reorderImages(dragIndex, index);
                    }
                  }}
                >
                  <img src={preview.url} alt={`Preview ${index + 1}`} />
                  <div className="imagen-controls">
                    {index === 0 && <div className="imagen-principal">🏠 Miniatura</div>}
                    <div className="imagen-orden">#{index + 1}</div>
                    <button
                      type="button"
                      onClick={() => eliminarImagen(index)}
                      className="btn-eliminar-imagen"
                    >
                      <FaTrash />
                    </button>
                  </div>
                  <div className="drag-handle">⋮⋮</div>
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
            {guardando ? (
              <>
                <div className="spinner-small"></div>
                {editandoId ? 'Actualizando...' : 'Guardando...'}
              </>
            ) : (
              <>
                {editandoId ? <FaEdit /> : <FaPlus />} 
                {editandoId ? 'Actualizar propiedad' : 'Crear propiedad'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );

  // Renderizar gestión de propiedades
  const renderPropiedades = () => (
    <div className="propiedades-admin">
      <div className="section-header">
        <h2>Gestión de propiedades</h2>
        <p>Administra todas las propiedades del sistema</p>
        <button 
          onClick={() => {
            limpiarFormulario();
            setActiveTab('crear');
          }}
          className="btn btn-primary"
        >
          <FaPlus /> Nueva propiedad
        </button>
      </div>

      <div className="properties-table-container">
        {loading ? (
          <div className="loading-center">
            <div className="spinner"></div>
            <p>Cargando propiedades...</p>
          </div>
        ) : propiedades.length === 0 ? (
          <div className="empty-state">
            <FaHome size={48} color="#ccc" />
            <h3>No hay propiedades</h3>
            <p>Comienza creando tu primera propiedad</p>
            <button 
              onClick={() => setActiveTab('crear')}
              className="btn btn-primary"
            >
              <FaPlus /> Crear propiedad
            </button>
          </div>
        ) : (
          <div className="properties-table">
            <table>
              <thead>
                <tr>
                  <th>Imagen</th>
                  <th>Título</th>
                  <th>Precio</th>
                  <th>Tipo</th>
                  <th>Ubicación</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {propiedades.map(prop => (
                  <tr key={prop.id}>
                    <td>
                      <div className="property-thumb">
                        <img 
                          src={prop.imagenes_propiedades?.[0]?.url_imagen || 'https://via.placeholder.com/60x40?text=Sin+Imagen'}
                          alt={prop.titulo}
                        />
                      </div>
                    </td>
                    <td>
                      <div className="property-title">
                        <strong>{prop.titulo}</strong>
                        <small>{prop.dormitorios} dorm, {prop.banos} baños</small>
                      </div>
                    </td>
                    <td><strong>S/ {prop.precio?.toLocaleString()}</strong></td>
                    <td className="capitalize">{prop.tipo_propiedad}</td>
                    <td>{prop.ubicacion}</td>
                    <td>
                      <span className={`status ${prop.activa ? 'active' : 'inactive'}`}>
                        {prop.activa ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td>
                      <small>{new Date(prop.fecha_creacion).toLocaleDateString()}</small>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-icon edit" 
                          title="Editar"
                          onClick={() => handleEditarPropiedad(prop)}
                        >
                          <FaEdit />
                        </button>
                        <button 
                          className="btn-icon view" 
                          title="Ver"
                          onClick={() => handleVerPropiedad(prop.id)}
                        >
                          <FaEye />
                        </button>
                        <button 
                          className="btn-icon delete" 
                          title="Eliminar"
                          onClick={() => handleEliminarPropiedad(prop.id)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  // Renderizar consultas
  const renderConsultas = () => (
    <div className="consultas-admin">
      <div className="section-header">
        <h2>Consultas de clientes</h2>
        <p>Revisa y gestiona las consultas recibidas</p>
      </div>

      <div className="consultas-table-container">
        {loading ? (
          <div className="loading-center">
            <div className="spinner"></div>
            <p>Cargando consultas...</p>
          </div>
        ) : consultas.length === 0 ? (
          <div className="empty-state">
            <FaEnvelope size={48} color="#ccc" />
            <h3>No hay consultas</h3>
            <p>Las consultas de los clientes aparecerán aquí</p>
          </div>
        ) : (
          <div className="consultas-table">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Propiedad</th>
                  <th>Mensaje</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {consultas.map(consulta => (
                  <tr key={consulta.id}>
                    <td><strong>{consulta.nombre_completo}</strong></td>
                    <td>{consulta.email}</td>
                    <td>{consulta.telefono}</td>
                    <td>
                      {consulta.propiedades ? (
                        <span className="propiedad-link">
                          {consulta.propiedades.titulo}
                        </span>
                      ) : (
                        <span className="consulta-general">Consulta general</span>
                      )}
                    </td>
                    <td>
                      <div className="mensaje-preview">
                        {consulta.mensaje?.substring(0, 50)}
                        {consulta.mensaje?.length > 50 && '...'}
                      </div>
                    </td>
                    <td>
                      <small>{new Date(consulta.fecha_consulta).toLocaleDateString()}</small>
                    </td>
                    <td>
                      <span className={`status ${consulta.estado === 'pendiente' ? 'pending' : 'completed'}`}>
                        {consulta.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  // Renderizar gestión de modales
  const renderModales = () => (
    <div className="modales-admin">
      <div className="section-header">
        <h2>Gestión de modales</h2>
        <p>Administra los modales que aparecen en el sitio web</p>
        <button 
          onClick={() => {
            limpiarFormularioModal();
            setActiveTab('crear-modal');
          }}
          className="btn btn-primary"
        >
          <FaPlus /> Nuevo modal
        </button>
      </div>

      <div className="modales-table-container">
        {loading ? (
          <div className="loading-center">
            <div className="spinner"></div>
            <p>Cargando modales...</p>
          </div>
        ) : modales.length === 0 ? (
          <div className="empty-state">
            <FaWindowRestore size={48} color="#ccc" />
            <h3>No hay modales</h3>
            <p>Crea tu primer modal personalizable</p>
            <button 
              onClick={() => setActiveTab('crear-modal')}
              className="btn btn-primary"
            >
              <FaPlus /> Crear modal
            </button>
          </div>
        ) : (
          <div className="modales-table">
            <table>
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Tamaño</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {modales.map(modal => (
                  <tr key={modal.id}>
                    <td>
                      <div className="modal-title-info">
                        <strong>{modal.titulo}</strong>
                        <div 
                          className="color-preview" 
                          style={{
                            backgroundColor: modal.color_fondo,
                            border: `2px solid ${modal.color_texto}`,
                            width: '20px',
                            height: '20px',
                            borderRadius: '4px',
                            marginTop: '4px'
                          }}
                        ></div>
                      </div>
                    </td>
                    <td className="capitalize">{modal.tamaño}</td>
                    <td>
                      <div className="toggle-container">
                        <button 
                          className={`toggle-btn ${modal.activo ? 'active' : 'inactive'}`}
                          onClick={() => handleToggleModal(modal.id, !modal.activo)}
                          title={modal.activo ? 'Desactivar' : 'Activar'}
                        >
                          {modal.activo ? <FaToggleOn /> : <FaToggleOff />}
                        </button>
                        <span className={`status ${modal.activo ? 'active' : 'inactive'}`}>
                          {modal.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <small>{new Date(modal.created_at).toLocaleDateString()}</small>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-icon edit" 
                          title="Editar"
                          onClick={() => handleEditarModal(modal)}
                        >
                          <FaEdit />
                        </button>
                        <button 
                          className="btn-icon delete" 
                          title="Eliminar"
                          onClick={() => handleEliminarModal(modal.id)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  // Renderizar formulario de crear/editar modal
  const renderCrearModal = () => (
    <div className="crear-modal">
      <div className="section-header">
        <h2>{editandoModalId ? 'Editar modal' : 'Crear nuevo modal'}</h2>
        <p>{editandoModalId ? 'Modifica la configuración del modal' : 'Crea un modal personalizable para el sitio web'}</p>
        {editandoModalId && (
          <button onClick={limpiarFormularioModal} className="btn btn-secondary">
            Cancelar edición
          </button>
        )}
      </div>

      <form onSubmit={handleModalSubmit} className="modal-form">
        <div className="form-section">
          <h3>Información básica</h3>
          
          <div className="form-group">
            <label htmlFor="titulo">Título del modal *</label>
            <input
              type="text"
              id="titulo"
              name="titulo"
              value={formularioModal.titulo}
              onChange={handleModalChange}
              required
              placeholder="Ej: Bienvenido a Tecnomadas"
            />
          </div>

          <div className="form-group">
            <label htmlFor="imagen">Imagen del modal (opcional)</label>
            <div className="imagen-input-container">
              <input
                type="file"
                id="imagen"
                accept="image/*"
                onChange={handleImagenModalChange}
                className="file-input"
              />
              <label htmlFor="imagen" className="file-input-label">
                <FaImage />
                Seleccionar imagen
              </label>
            </div>
            {previewImagenModal && (
              <div className="imagen-preview-modal">
                <img src={previewImagenModal} alt="Preview" />
                <button
                  type="button"
                  onClick={() => {
                    setImagenModal(null);
                    setPreviewImagenModal('');
                    setFormularioModal({...formularioModal, imagen_url: ''});
                  }}
                  className="btn-eliminar-imagen"
                >
                  <FaTrash />
                </button>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="contenido">Contenido *</label>
            <textarea
              id="contenido"
              name="contenido"
              value={formularioModal.contenido}
              onChange={handleModalChange}
              required
              rows="8"
              placeholder="Puedes usar HTML básico como <p>, <strong>, <br>, <a>, etc."
            />
            <small>Puedes usar HTML básico para formatear el texto</small>
          </div>
        </div>

        <div className="form-section">
          <h3>Apariencia</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="color_fondo">Color de fondo</label>
              <input
                type="color"
                id="color_fondo"
                name="color_fondo"
                value={formularioModal.color_fondo}
                onChange={handleModalChange}
                className="color-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="color_texto">Color del texto</label>
              <input
                type="color"
                id="color_texto"
                name="color_texto"
                value={formularioModal.color_texto}
                onChange={handleModalChange}
                className="color-input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="tamaño">Tamaño del modal</label>
              <select
                id="tamaño"
                name="tamaño"
                value={formularioModal.tamaño}
                onChange={handleModalChange}
              >
                <option value="pequeño">Pequeño (400px)</option>
                <option value="mediano">Mediano (600px)</option>
                <option value="grande">Grande (800px)</option>
              </select>
            </div>

            <div className="form-group">
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="activo"
                  name="activo"
                  checked={formularioModal.activo}
                  onChange={handleModalChange}
                />
                <label htmlFor="activo">Activar modal inmediatamente</label>
              </div>
            </div>
          </div>
        </div>

        <div className="preview-section">
          <h3>Vista previa</h3>
          <div 
            className="modal-preview"
            style={{
              backgroundColor: formularioModal.color_fondo,
              color: formularioModal.color_texto,
              border: '2px solid #ddd',
              borderRadius: '12px',
              padding: '2rem',
              maxWidth: formularioModal.tamaño === 'pequeño' ? '400px' :
                       formularioModal.tamaño === 'grande' ? '800px' : '600px',
              margin: '0 auto'
            }}
          >
            <h3 style={{ color: 'inherit', marginTop: 0 }}>
              {formularioModal.titulo || 'Título del modal'}
            </h3>
            {previewImagenModal && (
              <div style={{ margin: '1rem 0', textAlign: 'center' }}>
                <img 
                  src={previewImagenModal} 
                  alt="Vista previa" 
                  style={{ 
                    maxWidth: '100%', 
                    height: 'auto', 
                    borderRadius: '8px',
                    maxHeight: '200px',
                    objectFit: 'cover'
                  }} 
                />
              </div>
            )}
            <div 
              dangerouslySetInnerHTML={{ 
                __html: formularioModal.contenido || 'El contenido del modal aparecerá aquí...' 
              }}
              style={{ color: 'inherit' }}
            />
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn btn-primary btn-large"
            disabled={guardandoModal}
          >
            {guardandoModal ? (
              <>
                <div className="spinner-small"></div>
                {editandoModalId ? 'Actualizando...' : 'Guardando...'}
              </>
            ) : (
              <>
                {editandoModalId ? <FaEdit /> : <FaPlus />} 
                {editandoModalId ? 'Actualizar modal' : 'Crear modal'}
              </>
            )}
          </button>
        </div>
      </form>
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
            <button 
              className={`nav-item ${activeTab === 'modales' ? 'active' : ''}`}
              onClick={() => setActiveTab('modales')}
            >
              <FaWindowRestore /> Modales
            </button>
          </nav>
        </div>

        {/* Main content */}
        <div className="admin-main">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'crear' && renderCrearPropiedad()}
          {activeTab === 'propiedades' && renderPropiedades()}
          {activeTab === 'consultas' && renderConsultas()}
          {activeTab === 'modales' && renderModales()}
          {activeTab === 'crear-modal' && renderCrearModal()}
        </div>
      </div>

      <style jsx>{`
        .admin {
          min-height: 100vh;
          background: #f5f7fa;
        }

        .admin-header {
          background: white;
          padding: 1rem 2rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-left h1 {
          margin: 0;
          color: #2c3e50;
          font-size: 1.5rem;
        }

        .header-left p {
          margin: 0;
          color: #666;
          font-size: 0.9rem;
        }

        .admin-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .admin-info span {
          color: #666;
          font-size: 0.9rem;
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #dc3545;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: background 0.2s;
        }

        .logout-btn:hover {
          background: #c82333;
        }

        .admin-layout {
          display: flex;
          min-height: calc(100vh - 80px);
        }

        .admin-sidebar {
          width: 250px;
          background: white;
          box-shadow: 2px 0 4px rgba(0,0,0,0.1);
        }

        .sidebar-nav {
          padding: 1rem 0;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          padding: 1rem 1.5rem;
          background: none;
          border: none;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s;
          color: #666;
          font-size: 0.95rem;
        }

        .nav-item:hover {
          background: #f8f9fa;
          color: #007bff;
        }

        .nav-item.active {
          background: #007bff;
          color: white;
        }

        .admin-main {
          flex: 1;
          padding: 2rem;
          overflow-y: auto;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .stat-icon {
          width: 50px;
          height: 50px;
          background: #007bff;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
        }

        .stat-content h3 {
          margin: 0;
          font-size: 2rem;
          color: #2c3e50;
        }

        .stat-content p {
          margin: 0;
          color: #666;
          font-size: 0.9rem;
        }

        .recent-properties {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .recent-properties h3 {
          margin: 0 0 1rem 0;
          color: #2c3e50;
        }

        .properties-table-container {
          overflow-x: auto;
        }

        .properties-table table {
          width: 100%;
          border-collapse: collapse;
        }

        .properties-table th,
        .properties-table td {
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid #eee;
        }

        .properties-table th {
          background: #f8f9fa;
          font-weight: 600;
          color: #2c3e50;
        }

        .property-thumb {
          width: 60px;
          height: 40px;
          border-radius: 6px;
          overflow: hidden;
        }

        .property-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .property-title {
          display: flex;
          flex-direction: column;
        }

        .property-title small {
          color: #666;
          text-transform: capitalize;
        }

        .status {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .status.active {
          background: #d4edda;
          color: #155724;
        }

        .status.inactive {
          background: #f8d7da;
          color: #721c24;
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .btn-icon {
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          transition: all 0.2s;
        }

        .btn-icon.edit {
          background: #e3f2fd;
          color: #1976d2;
        }

        .btn-icon.view {
          background: #e8f5e8;
          color: #388e3c;
        }

        .btn-icon.delete {
          background: #ffebee;
          color: #d32f2f;
        }

        .btn-icon:hover {
          transform: scale(1.1);
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #666;
        }

        .empty-state h3 {
          margin: 1rem 0;
          color: #2c3e50;
        }

        .loading-center {
          text-align: center;
          padding: 3rem;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        .spinner-small {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .section-header {
          margin-bottom: 2rem;
        }

        .section-header h2 {
          margin: 0 0 0.5rem 0;
          color: #2c3e50;
        }

        .section-header p {
          margin: 0;
          color: #666;
        }

        .propiedad-form {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .form-section {
          margin-bottom: 2rem;
        }

        .form-section h3 {
          color: #2c3e50;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #007bff;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
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
          margin-top: 1rem;
        }

        .imagenes-info {
          grid-column: 1 / -1;
          background: #e3f2fd;
          padding: 1rem;
          border-radius: 8px;
          border-left: 4px solid #007bff;
          margin-bottom: 1rem;
        }

        .imagenes-info p {
          margin: 0;
          color: #1976d2;
          font-size: 0.9rem;
        }

        .imagen-preview {
          position: relative;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          cursor: move;
          transition: transform 0.2s, box-shadow 0.2s;
          background: white;
        }

        .imagen-preview:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .imagen-preview img {
          width: 100%;
          height: 120px;
          object-fit: cover;
          pointer-events: none;
        }

        .imagen-controls {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.7);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 0.5rem;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .imagen-preview:hover .imagen-controls {
          opacity: 1;
        }

        .imagen-principal {
          background: #28a745;
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 500;
          align-self: flex-start;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .imagen-orden {
          position: absolute;
          bottom: 0.5rem;
          left: 0.5rem;
          background: rgba(0, 123, 255, 0.9);
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .drag-handle {
          position: absolute;
          bottom: 0.5rem;
          right: 2.5rem;
          color: white;
          font-size: 1.2rem;
          font-weight: bold;
          text-shadow: 0 1px 2px rgba(0,0,0,0.5);
          cursor: move;
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
          font-size: 0.8rem;
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
          .admin-layout {
            flex-direction: column;
          }

          .admin-sidebar {
            width: 100%;
            height: auto;
          }

          .sidebar-nav {
            display: flex;
            overflow-x: auto;
          }

          .nav-item {
            white-space: nowrap;
          }

          .admin-main {
            padding: 1rem;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .caracteristicas-input {
            flex-direction: column;
          }
        }

        /* Estilos para modales */
        .modal-title-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .color-preview {
          flex-shrink: 0;
        }

        .toggle-container {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .toggle-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          transition: transform 0.2s;
        }

        .toggle-btn:hover {
          transform: scale(1.1);
        }

        .toggle-btn.active {
          color: #28a745;
        }

        .toggle-btn.inactive {
          color: #6c757d;
        }

        .status.pending {
          background: #fff3cd;
          color: #856404;
        }

        .capitalize {
          text-transform: capitalize;
        }

        .modal-form {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .color-input {
          width: 60px;
          height: 40px;
          border: 1px solid #ddd;
          border-radius: 6px;
          cursor: pointer;
          padding: 0;
        }

        .checkbox-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .checkbox-group input[type="checkbox"] {
          width: auto;
          margin: 0;
        }

        .preview-section {
          margin: 2rem 0;
          padding: 2rem;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .preview-section h3 {
          margin-bottom: 1rem;
          color: #2c3e50;
          text-align: center;
        }

        .modal-preview {
          position: relative;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        .propiedad-link {
          color: #007bff;
          text-decoration: none;
          font-weight: 500;
        }

        .consulta-general {
          color: #666;
          font-style: italic;
        }

        .mensaje-preview {
          max-width: 200px;
          word-break: break-word;
        }

        /* Estilos para imagen en modal */
        .imagen-input-container {
          position: relative;
          margin-bottom: 1rem;
        }

        .file-input {
          display: none;
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
          font-size: 1rem;
          font-weight: 500;
        }

        .file-input-label:hover {
          background: #0056b3;
        }

        .imagen-preview-modal {
          position: relative;
          display: inline-block;
          margin-top: 1rem;
        }

        .imagen-preview-modal img {
          max-width: 200px;
          max-height: 150px;
          object-fit: cover;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .imagen-preview-modal .btn-eliminar-imagen {
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
          font-size: 0.8rem;
        }

        .imagen-preview-modal .btn-eliminar-imagen:hover {
          background: #dc3545;
        }
      `}</style>
    </div>
  );
};

export default Admin;