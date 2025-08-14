import { supabase } from '../config/supabase';

// Obtener configuración del modal activo
export const getModalActivo = async () => {
  try {
    const { data, error } = await supabase
      .from('modal_config')
      .select('*')
      .eq('activo', true)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      throw error;
    }
    
    return { 
      success: true, 
      data: data || null // null si no hay modal activo
    };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error: error.message };
  }
};

// Obtener todas las configuraciones de modal para admin
export const getAllModales = async () => {
  try {
    const { data, error } = await supabase
      .from('modal_config')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error: error.message };
  }
};

// Crear nueva configuración de modal
export const crearModal = async (modalData) => {
  try {
    // Si el nuevo modal va a estar activo, desactivar todos los demás
    if (modalData.activo) {
      await supabase
        .from('modal_config')
        .update({ activo: false })
        .neq('id', 'temp'); // Actualizar todos los registros
    }

    const { data, error } = await supabase
      .from('modal_config')
      .insert([{
        titulo: modalData.titulo,
        contenido: modalData.contenido,
        imagen_url: modalData.imagen_url || null,
        color_fondo: modalData.color_fondo || '#ffffff',
        color_texto: modalData.color_texto || '#000000',
        tamaño: modalData.tamaño || 'mediano',
        activo: modalData.activo || false,
        created_at: new Date().toISOString()
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

// Actualizar configuración de modal
export const actualizarModal = async (id, modalData) => {
  try {
    // Si el modal va a estar activo, desactivar todos los demás
    if (modalData.activo) {
      await supabase
        .from('modal_config')
        .update({ activo: false })
        .neq('id', id);
    }

    const { data, error } = await supabase
      .from('modal_config')
      .update({
        titulo: modalData.titulo,
        contenido: modalData.contenido,
        imagen_url: modalData.imagen_url || null,
        color_fondo: modalData.color_fondo,
        color_texto: modalData.color_texto,
        tamaño: modalData.tamaño,
        activo: modalData.activo,
        updated_at: new Date().toISOString()
      })
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

// Eliminar modal
export const eliminarModal = async (id) => {
  try {
    const { data, error } = await supabase
      .from('modal_config')
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

// Activar/desactivar modal
export const toggleModalActivo = async (id, activo) => {
  try {
    // Si va a activar este modal, desactivar todos los demás
    if (activo) {
      await supabase
        .from('modal_config')
        .update({ activo: false })
        .neq('id', id);
    }

    const { data, error } = await supabase
      .from('modal_config')
      .update({ 
        activo,
        updated_at: new Date().toISOString()
      })
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