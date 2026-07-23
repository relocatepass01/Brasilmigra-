// ============================================
// SISTEMA DE AUTENTICACIÓN SEGURA
// ============================================

// Importar Supabase (se carga desde CDN en index.html)
// Necesitas agregar en tu index.html:
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

let supabase = null;

// Inicializar Supabase
function initSupabase() {
    const SUPABASE_URL = 'TU_SUPABASE_URL_AQUI'; // Reemplazar
    const SUPABASE_KEY = 'TU_SUPABASE_KEY_AQUI'; // Reemplazar
    
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

// ============================================
// REGISTRO DE NUEVO USUARIO
// ============================================

async function registroUsuario(email, contraseña, nombre) {
    try {
        // Validar email
        if (!email || !email.includes('@')) {
            alert('❌ Email inválido');
            return false;
        }

        // Validar contraseña
        if (!contraseña || contraseña.length < 8) {
            alert('❌ La contraseña debe tener mínimo 8 caracteres');
            return false;
        }

        // Validar nombre
        if (!nombre || nombre.length < 3) {
            alert('❌ El nombre debe tener mínimo 3 caracteres');
            return false;
        }

        // Crear usuario en Supabase
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: contraseña,
            options: {
                data: {
                    nombre: nombre
                }
            }
        });

        if (error) {
            console.error('Error en registro:', error);
            alert('❌ Error al registrar: ' + error.message);
            return false;
        }

        // Guardar datos adicionales en tabla usuarios
        const { error: dbError } = await supabase
            .from('usuarios')
            .insert([
                {
                    id: data.user.id,
                    email: email,
                    nombre: nombre,
                    created_at: new Date()
                }
            ]);

        if (dbError) {
            console.error('Error guardando usuario:', dbError);
            alert('❌ Error al guardar perfil: ' + dbError.message);
            return false;
        }

        alert('✅ Registro exitoso! Verifica tu email para confirmar');
        return true;

    } catch (error) {
        console.error('Error inesperado:', error);
        alert('❌ Error inesperado: ' + error.message);
        return false;
    }
}

// ============================================
// LOGIN DE USUARIO
// ============================================

async function loginUsuario(email, contraseña) {
    try {
        // Validar campos
        if (!email || !contraseña) {
            alert('❌ Completa todos los campos');
            return false;
        }

        // Autenticar con Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: contraseña
        });

        if (error) {
            console.error('Error en login:', error);
            alert('❌ Email o contraseña inválida');
            return false;
        }

        // Guardar sesión localmente
        localStorage.setItem('usuario_id', data.user.id);
        localStorage.setItem('usuario_email', data.user.email);
        localStorage.setItem('token_sesion', data.session.access_token);

        // Obtener datos del usuario
        const { data: userData, error: userError } = await supabase
            .from('usuarios')
            .select('*')
            .eq('id', data.user.id)
            .single();

        if (!userError && userData) {
            localStorage.setItem('usuario_nombre', userData.nombre);
        }

        alert('✅ Bienvenido ' + (userData?.nombre || email));
        
        // Redirigir al dashboard
        window.location.href = 'dashboard.html';
        return true;

    } catch (error) {
        console.error('Error inesperado:', error);
        alert('❌ Error: ' + error.message);
        return false;
    }
}

// ============================================
// LOGOUT DE USUARIO
// ============================================

async function logoutUsuario() {
    try {
        // Logout de Supabase
        await supabase.auth.signOut();

        // Limpiar localStorage
        localStorage.removeItem('usuario_id');
        localStorage.removeItem('usuario_email');
        localStorage.removeItem('usuario_nombre');
        localStorage.removeItem('token_sesion');

        alert('✅ Sesión cerrada');
        window.location.href = 'index.html';
        return true;

    } catch (error) {
        console.error('Error al logout:', error);
        return false;
    }
}

// ============================================
// VERIFICAR SESIÓN ACTIVA
// ============================================

function verificarSesion() {
    const usuarioId = localStorage.getItem('usuario_id');
    const token = localStorage.getItem('token_sesion');

    if (!usuarioId || !token) {
        // No hay sesión
        return false;
    }

    return {
        id: usuarioId,
        email: localStorage.getItem('usuario_email'),
        nombre: localStorage.getItem('usuario_nombre')
    };
}

// ============================================
// VERIFICAR ACCESO (Redirigir si no está logueado)
// ============================================

function verificarAcceso() {
    const sesion = verificarSesion();
    
    if (!sesion) {
        alert('❌ Debes iniciar sesión primero');
        window.location.href = 'index.html';
        return false;
    }

    return sesion;
}

// ============================================
// CAMBIAR CONTRASEÑA
// ============================================

async function cambiarContraseña(contraseñaActual, contraseñaNueva) {
    try {
        if (!contraseñaNueva || contraseñaNueva.length < 8) {
            alert('❌ La nueva contraseña debe tener mínimo 8 caracteres');
            return false;
        }

        // Actualizar contraseña en Supabase
        const { error } = await supabase.auth.updateUser({
            password: contraseñaNueva
        });

        if (error) {
            alert('❌ Error al cambiar contraseña: ' + error.message);
            return false;
        }

        alert('✅ Contraseña cambiada exitosamente');
        return true;

    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error: ' + error.message);
        return false;
    }
}

// ============================================
// RECUPERAR CONTRASEÑA
// ============================================

async function recuperarContraseña(email) {
    try {
        if (!email) {
            alert('❌ Ingresa tu email');
            return false;
        }

        // Enviar email de recuperación
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/reset-password.html'
        });

        if (error) {
            alert('❌ Error: ' + error.message);
            return false;
        }

        alert('✅ Email de recuperación enviado. Revisa tu bandeja de entrada');
        return true;

    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error: ' + error.message);
        return false;
    }
}

// ============================================
// OBTENER USUARIO ACTUAL
// ============================================

async function obtenerUsuarioActual() {
    try {
        const { data, error } = await supabase.auth.getUser();
        
        if (error || !data.user) {
            return null;
        }

        return data.user;

    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

// ============================================
// ACTUALIZAR PERFIL
// ============================================

async function actualizarPerfil(usuarioId, datos) {
    try {
        // Actualizar en tabla usuarios
        const { error } = await supabase
            .from('usuarios')
            .update({
                nombre: datos.nombre || undefined,
                foto_perfil: datos.foto_perfil || undefined
            })
            .eq('id', usuarioId);

        if (error) {
            alert('❌ Error al actualizar perfil: ' + error.message);
            return false;
        }

        // Actualizar en tabla perfil_usuario
        const { error: perfError } = await supabase
            .from('perfil_usuario')
            .upsert({
                usuario_id: usuarioId,
                pasaporte: datos.pasaporte,
                rne: datos.rne,
                cpf: datos.cpf,
                direccion: datos.direccion,
                fecha_llegada: datos.fecha_llegada,
                nationalidad: datos.nationalidad
            });

        if (perfError) {
            alert('❌ Error al guardar datos: ' + perfError.message);
            return false;
        }

        alert('✅ Perfil actualizado exitosamente');
        return true;

    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error: ' + error.message);
        return false;
    }
}

// ============================================
// OBTENER PERFIL COMPLETO
// ============================================

async function obtenerPerfilCompleto(usuarioId) {
    try {
        // Obtener datos usuario
        const { data: usuario, error: userError } = await supabase
            .from('usuarios')
            .select('*')
            .eq('id', usuarioId)
            .single();

        if (userError) {
            console.error('Error:', userError);
            return null;
        }

        // Obtener perfil adicional
        const { data: perfil, error: perfError } = await supabase
            .from('perfil_usuario')
            .select('*')
            .eq('usuario_id', usuarioId)
            .single();

        return {
            ...usuario,
            ...(perfil || {})
        };

    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

// ============================================
// INICIALIZAR AL CARGAR
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    initSupabase();
    console.log('✅ Sistema de autenticación iniciado');
});
