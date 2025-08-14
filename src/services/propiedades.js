import { supabase } from '../config/supabase';

// Obtener todas las propiedades activas
export const getPropiedades = async () => {
  try {
    const { data, error } = await supabase
      .from('propiedades')
      .select(`
        *,
        imagenes_propiedades (
          id,
          url_imagen,
          es_principal
        )
      `)
      .eq('activa', true)
      .order('fecha_creacion', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error: error.message };
  }
};

// Obtener propiedad por ID
export const getPropiedadById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('propiedades')
      .select(`
        *,
        imagenes_propiedades (
          id,
          url_imagen,
          es_principal
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error: error.message };
  }
};

// Buscar propiedades con filtros
export const buscarPropiedades = async (filtros) => {
  try {
    let query = supabase
      .from('propiedades')
      .select(`
        *,
        imagenes_propiedades (
          id,
          url_imagen,
          es_principal
        )
      `)
      .eq('activa', true);

    // Aplicar filtros
    if (filtros.precio_min) {
      query = query.gte('precio', parseFloat(filtros.precio_min));
    }
    if (filtros.precio_max) {
      query = query.lte('precio', parseFloat(filtros.precio_max));
    }
    if (filtros.tipo_propiedad) {
      query = query.eq('tipo_propiedad', filtros.tipo_propiedad);
    }
    if (filtros.dormitorios) {
      query = query.gte('dormitorios', parseInt(filtros.dormitorios));
    }
    if (filtros.banos) {
      query = query.gte('banos', parseInt(filtros.banos));
    }
    if (filtros.ubicacion) {
      query = query.ilike('ubicacion', `%${filtros.ubicacion}%`);
    }

    const { data, error } = await query.order('fecha_creacion', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error: error.message };
  }
};

// Convertir imagen a base64 para almacenar temporalmente
export const convertirImagenABase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

// Procesar imagen para hosting
export const procesarImagen = async (file, propiedadId) => {
  try {
    // Crear nombre único
    const fileExt = file.name.split('.').pop();
    const fileName = `propiedad-${propiedadId}-${Date.now()}.${fileExt}`;
    
    // Convertir a base64 para almacenar temporalmente en la base de datos
    // En hosting real, aquí subirías el archivo físicamente
    const base64 = await convertirImagenABase64(file);
    
    return { 
      success: true, 
      url: base64, // Para desarrollo usamos base64
      fileName,
      // Para producción sería: url: `/uploads/${fileName}`
    };
  } catch (error) {
    console.error('Error procesando imagen:', error);
    return { success: false, error: error.message };
  }
};

// Crear nueva propiedad
export const crearPropiedad = async (propiedadData, imagenes) => {
  try {
    // Insertar propiedad
    const { data: propiedad, error: propError } = await supabase
      .from('propiedades')
      .insert([{
        ...propiedadData,
        precio: parseFloat(propiedadData.precio),
        precio_usd: propiedadData.precio_usd ? parseFloat(propiedadData.precio_usd) : null,
        area_total: parseFloat(propiedadData.area_total),
        dormitorios: parseInt(propiedadData.dormitorios),
        banos: parseInt(propiedadData.banos),
        estacionamientos: parseInt(propiedadData.estacionamientos),
        ano_construccion: parseInt(propiedadData.ano_construccion),
        caracteristicas: Array.isArray(propiedadData.caracteristicas) 
          ? propiedadData.caracteristicas 
          : JSON.parse(propiedadData.caracteristicas || '[]'),
        activa: true,
        fecha_creacion: new Date().toISOString()
      }])
      .select()
      .single();

    if (propError) throw propError;

    // Procesar imágenes si hay
    if (imagenes && imagenes.length > 0) {
      const imagenesData = [];
      
      for (let i = 0; i < imagenes.length; i++) {
        const procesarResult = await procesarImagen(imagenes[i], propiedad.id);
        
        if (procesarResult.success) {
          imagenesData.push({
            propiedad_id: propiedad.id,
            url_imagen: procesarResult.url,
            es_principal: i === 0
          });
        }
      }

      if (imagenesData.length > 0) {
        const { error: imgError } = await supabase
          .from('imagenes_propiedades')
          .insert(imagenesData);

        if (imgError) throw imgError;
      }
    }

    return { success: true, data: propiedad };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error: error.message };
  }
};

// Actualizar propiedad
export const actualizarPropiedad = async (id, propiedadData, imagenes = null) => {
  try {
    // Actualizar propiedad
    const { data: propiedad, error: propError } = await supabase
      .from('propiedades')
      .update({
        ...propiedadData,
        precio: parseFloat(propiedadData.precio),
        precio_usd: propiedadData.precio_usd ? parseFloat(propiedadData.precio_usd) : null,
        area_total: parseFloat(propiedadData.area_total),
        dormitorios: parseInt(propiedadData.dormitorios),
        banos: parseInt(propiedadData.banos),
        estacionamientos: parseInt(propiedadData.estacionamientos),
        ano_construccion: parseInt(propiedadData.ano_construccion),
        caracteristicas: Array.isArray(propiedadData.caracteristicas) 
          ? propiedadData.caracteristicas 
          : JSON.parse(propiedadData.caracteristicas || '[]')
      })
      .eq('id', id)
      .select()
      .single();

    if (propError) throw propError;

    // Si se proporcionan nuevas imágenes, procesarlas
    if (imagenes && imagenes.length > 0) {
      // Eliminar imágenes existentes
      await supabase
        .from('imagenes_propiedades')
        .delete()
        .eq('propiedad_id', id);

      const imagenesData = [];
      
      for (let i = 0; i < imagenes.length; i++) {
        const procesarResult = await procesarImagen(imagenes[i], id);
        
        if (procesarResult.success) {
          imagenesData.push({
            propiedad_id: id,
            url_imagen: procesarResult.url,
            es_principal: i === 0
          });
        }
      }

      if (imagenesData.length > 0) {
        const { error: imgError } = await supabase
          .from('imagenes_propiedades')
          .insert(imagenesData);

        if (imgError) throw imgError;
      }
    }

    return { success: true, data: propiedad };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error: error.message };
  }
};

// Eliminar propiedad (soft delete)
export const eliminarPropiedad = async (id) => {
  try {
    const { data, error } = await supabase
      .from('propiedades')
      .update({ activa: false })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error: error.message };
  }
};

// Eliminar propiedad permanentemente
export const eliminarPropiedadPermanente = async (id) => {
  try {
    // Primero eliminar imágenes relacionadas
    await supabase
      .from('imagenes_propiedades')
      .delete()
      .eq('propiedad_id', id);

    // Luego eliminar la propiedad
    const { data, error } = await supabase
      .from('propiedades')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error: error.message };
  }
};

// Obtener todas las propiedades (incluyendo inactivas) para admin
export const getPropiedadesAdmin = async () => {
  try {
    const { data, error } = await supabase
      .from('propiedades')
      .select(`
        *,
        imagenes_propiedades (
          id,
          url_imagen,
          es_principal
        )
      `)
      .order('fecha_creacion', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error: error.message };
  }
};

// Obtener todas las consultas para admin
export const getConsultas = async () => {
  try {
    const { data, error } = await supabase
      .from('consultas')
      .select(`
        *,
        propiedades (
          id,
          titulo
        )
      `)
      .order('fecha_consulta', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error: error.message };
  }
};

// Enviar consulta
export const enviarConsulta = async (consultaData) => {
  try {
    const { data, error } = await supabase
      .from('consultas')
      .insert([{
        ...consultaData,
        fecha_consulta: new Date().toISOString(),
        estado: 'pendiente'
      }])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error: error.message };
  }
};