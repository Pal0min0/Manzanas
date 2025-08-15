// (Pega la ruta /servicios-usuario aquí, después de la inicialización de app y los requires)
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const app = express();
const path = require('path');
const moment = require('moment');
const cors = require('cors');

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configuración de express-session
const session = require('express-session');
app.use(session({
    secret: 'miSecreto',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Configuración de la base de datos
const db = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'manzanasANB',
};

// Función helper para manejo de errores
const handleDbError = (error, res) => {
    console.error('Error de base de datos:', error);
    
    // Determinar el tipo de error
    let errorMessage = 'Error interno del servidor';
    
    if (error.code === 'ER_DUP_ENTRY') {
        errorMessage = 'El usuario ya existe en la base de datos';
    } else if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        errorMessage = 'La manzana seleccionada no existe';
    } else if (error.code === 'ER_BAD_FIELD_ERROR') {
        errorMessage = 'Error en la estructura de la base de datos';
    } else if (error.code === 'ECONNREFUSED') {
        errorMessage = 'No se puede conectar a la base de datos';
    }
    
    res.status(500).json({
        success: false,
        message: errorMessage,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
};

// Middleware para verificar autenticación de administrador
const verificarAdministrador = (req, res, next) => {
    if (req.session.usuario && req.session.usuario.Rol === 'administrador') {
        next();
    } else {
        res.status(403).json({ 
            success: false, 
            message: 'Acceso denegado - Se requiere rol de administrador' 
        });
    }
};

// Ruta para servir la página principal
app.get('/api/ingresar', (req, res) => {
    res.status(201).sendFile(path.join(__dirname, 'Front', '/inicio'))
});

// Obtener todas las manzanas disponibles
app.get('/api/manzanas', async (req, res) => {
    let connection;
    try {
        connection = await mysql.createConnection(db);
        const [rows] = await connection.execute('SELECT * FROM manzanas ORDER BY Id_M');
        res.json({ success: true, data: rows });
    } catch (error) {
        handleDbError(error, res);
    } finally {
        if (connection) await connection.end();
    }
});

// ===== RUTAS DE AUTENTICACIÓN =====

// Crear usuario
app.post('/api/crear', async (req, res) => {
    const { NombreUsuario, TipoDocumento, Documento, Rol, Man } = req.body;
    
    if (!NombreUsuario || !TipoDocumento || !Documento || !Rol || !Man) {
        return res.status(400).json({
            success: false,
            message: 'Todos los campos son requeridos'
        });
    }

    let connection;
    try {
        connection = await mysql.createConnection(db);
        
        // Verificar que la manzana existe
        const [manzanaRows] = await connection.execute(
            'SELECT Id_M FROM manzanas WHERE Id_M = ?', 
            [Man]
        );
        
        if (manzanaRows.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'La manzana seleccionada no existe'
            });
        }
        
        // Verificar si el usuario ya existe
        const [rows] = await connection.execute(
            'SELECT * FROM usuario WHERE Documento = ? AND TipoDocumento = ?', 
            [Documento, TipoDocumento]
        );
        
        if (rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Usuario ya existe'
            });
        }
        
        // Insertar nuevo usuario
        await connection.execute(
            'INSERT INTO usuario (NombreUsuario, TipoDocumento, Documento, Rol, Id_M1) VALUES (?, ?, ?, ?, ?)', 
            [NombreUsuario, TipoDocumento, Documento, Rol, Man]
        );
        
        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            data: { NombreUsuario, TipoDocumento, Documento, Rol, Man }
        });
        
    } catch (error) {
        handleDbError(error, res);
    } finally {
        if (connection) await connection.end();
    }
});

// Iniciar sesión
app.post('/api/iniciar', async (req, res) => {
    const { TipoDocumento, Documento } = req.body;
    
    if (!TipoDocumento || !Documento) {
        return res.status(400).json({
            success: false,
            message: 'Tipo de documento y documento son requeridos'
        });
    }

    let connection;
    try {
        connection = await mysql.createConnection(db);
        
        // Verificar credenciales
        const [rows] = await connection.execute(
            'SELECT * FROM usuario WHERE TipoDocumento = ? AND Documento = ?', 
            [TipoDocumento, Documento]
        );
        
        if (rows.length > 0) {
            const usuario = rows[0];
            
            // Obtener información de la manzana
            const [manzanaRows] = await connection.execute(
                'SELECT manzanas.NombreManzana FROM usuario INNER JOIN manzanas ON usuario.Id_M1 = manzanas.Id_M WHERE usuario.NombreUsuario = ?', 
                [usuario.NombreUsuario]
            );
            
            // Guardar en sesión
            req.session.usuario = {
                Id: usuario.Id,
                Documento: usuario.Documento,
                NombreUsuario: usuario.NombreUsuario,
                Rol: usuario.Rol,
                TipoDocumento: usuario.TipoDocumento,
                Id_M1: usuario.Id_M1
            };
       
            res.status(200).json({
                success: true,
                message: 'Inicio de sesión exitoso',
                redirect: usuario.Rol === 'administrador' ? '/administrador' : '/usuario', 
                data: {
                    Id: usuario.Id,
                    NombreUsuario: usuario.NombreUsuario,
                    TipoDocumento: usuario.TipoDocumento,
                    Documento: usuario.Documento,
                    Rol: usuario.Rol,
                    Id_M1: usuario.Id_M1,
                    manzana: manzanaRows.length > 0 ? manzanaRows[0].NombreManzana : null
                }
            });
        } else {
            res.status(401).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        
    } catch (error) {
        handleDbError(error, res);
    } finally {
        if (connection) await connection.end();
    }
});

// ===== RUTAS DE USUARIO =====

// Obtener datos del usuario logueado
// Obtener datos del usuario logueado - CORREGIDO
app.get('/api/usuario', (req, res) => {
    if (req.session.usuario) {
        // FIX: Usar req.session.usuario.* en lugar de req.session.*
        const usuario = req.session.usuario;
        res.json({
            success: true,
            data: {
                Id: usuario.Id,
                NombreUsuario: usuario.NombreUsuario,
                TipoDocumento: usuario.TipoDocumento,
                Documento: usuario.Documento,
                Rol: usuario.Rol,
                Id_M1: usuario.Id_M1
            }
        });
    } else {
        res.status(401).json({
            success: false,
            message: 'No hay sesión activa'
        });
    }
});

// Obtener servicios disponibles para el usuario
app.get('/api/servicios-disponibles', async (req, res) => {
  let connection;
  try {
    connection = await mysql.createConnection(db);
    const [result] = await connection.execute('SELECT * FROM servicios'); // Usa 'servicios' consistentemente
    res.json({ success: true, data: result });
  } catch (error) {
    handleDbError(error, res);
  } finally {
    if (connection) await connection.end();
  }
});

// Obtener servicios por manzana - CORREGIDO
app.get('/api/servicios-por-manzana', async (req, res) => {
  let connection;
  try {
    // Verifica si hay una sesión activa
    if (!req.session.usuario || !req.session.usuario.Id_M1) {
      return res.status(401).json({ mensaje: 'No autorizado o manzana no definida' });
    }

    const idManzana = req.session.usuario.Id_M1;
    
    // FIX: Usar mysql.createConnection(db) en lugar de db.execute
    connection = await mysql.createConnection(db);

    const [servicios] = await connection.execute(
      `SELECT s.Id_S, s.NombreServicio, s.TipoServicio
       FROM servicios s
       JOIN m_s ON s.Id_S = m_s.Id_S1
       WHERE m_s.Id_M1 = ?`,
      [idManzana]
    );

    res.json({
      success: true,
      data: servicios
    });
  } catch (error) {
    console.error('Error al obtener servicios por manzana:', error);
    res.status(500).json({ 
      success: false, 
      mensaje: 'Error en el servidor' 
    });
  } finally {
    if (connection) await connection.end();
  }
});

app.get('/api/servicios-por-manzana/:idManzana', async (req, res) => {
  let connection;
  try {
    const idManzana = req.params.idManzana;
    connection = await mysql.createConnection(db);
    const [servicios] = await connection.execute(
      `SELECT s.Id_S, s.NombreServicio, s.TipoServicio
       FROM servicios s
       JOIN m_s ON s.Id_S = m_s.Id_S1
       WHERE m_s.Id_M1 = ?`,
      [idManzana]
    );
    res.json({ success: true, data: servicios });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  } finally {
    if (connection) await connection.end();
  }
});


// Guardar solicitud de servicio
// Guardar solicitud de servicio - CORREGIDO
app.post('/api/solicitar-servicio', async (req, res) => {
    const usuario = req.session.usuario;
    const { servicios, fechaHora } = req.body;
    
    if (!usuario) {
        return res.status(401).json({
            success: false,
            message: 'Usuario no autenticado'
        });
    }
    
    if (!servicios || !fechaHora) {
        return res.status(400).json({
            success: false,
            message: 'Servicio y fecha son requeridos'
        });
    }

    let connection;
    try {
        connection = await mysql.createConnection(db);
        
        // Verificar que el servicio existe
        const [servicioRows] = await connection.execute(
            'SELECT Id_S FROM servicios WHERE Id_S = ?', 
            [servicios]
        );
        
        if (servicioRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Servicio no encontrado'
            });
        }
        
        // Insertar solicitud usando el ID del usuario de la sesión
        const [result] = await connection.execute(
            'INSERT INTO solicitudes (Fecha, Id1, CodigoS) VALUES (?, ?, ?)', 
            [fechaHora, usuario.Id, servicios]
        );
        
        res.status(201).json({
            success: true,
            message: 'Solicitud de servicio guardada exitosamente',
            data: {
                solicitudId: result.insertId,
                servicio: servicios,
                fechaHora: fechaHora
            }
        });
        
    } catch (error) {
        handleDbError(error, res);
    } finally {
        if (connection) await connection.end();
    }
});

// Obtener solicitudes del usuario
// Reemplaza el endpoint /api/mis-solicitudes en tu código del servidor

// Obtener solicitudes del usuario
// Obtener solicitudes del usuario - CORREGIDO
app.get('/api/mis-solicitudes', async (req, res) => {
    const usuario = req.session.usuario;
    
    if (!usuario) {
        return res.status(401).json({
            success: false,
            message: 'Usuario no autenticado'
        });
    }

    // FIX: Usar usuario.Documento en lugar de req.session.Documento
    const Documento = usuario.Documento;
    console.log('Documento en sesión:', Documento); 
    
    let connection;
    try {
        connection = await mysql.createConnection(db);
        
        // Query simplificada - solo necesitamos join entre solicitudes, servicios y usuario
        const [solicitudesData] = await connection.execute(
            `SELECT 
                servicios.NombreServicio, 
                solicitudes.Fecha, 
                solicitudes.Id_solicitudes 
            FROM solicitudes 
            INNER JOIN servicios ON solicitudes.CodigoS = servicios.Id_S 
            INNER JOIN usuario ON solicitudes.Id1 = usuario.Id 
            WHERE usuario.Documento = ?
            ORDER BY solicitudes.Fecha DESC`, 
            [Documento]
        );
        
        const solicitudesFormateadas = solicitudesData.map(solicitud => ({
            id: solicitud.Id_solicitudes,
            NombreServicio: solicitud.NombreServicio,
            fecha: moment(solicitud.Fecha).format('YYYY-MM-DD HH:mm:ss')
        }));
        
        res.json({
            success: true,
            data: solicitudesFormateadas
        });
        
    } catch (error) {
        console.error('Error al obtener solicitudes:', error);
        handleDbError(error, res);
    } finally {
        if (connection) await connection.end();
    }
});

// Eliminar solicitud
// Eliminar solicitud - CORREGIDO
app.delete('/api/solicitudes/:id', async (req, res) => {
    const solicitudId = req.params.id;
    const usuario = req.session.usuario;
    
    if (!usuario) {
        return res.status(401).json({
            success: false,
            message: 'Usuario no autenticado'
        });
    }
    
    if (!solicitudId) {
        return res.status(400).json({
            success: false,
            message: 'ID de solicitud requerido'
        });
    }

    let connection;
    try {
        connection = await mysql.createConnection(db);
        
        // FIX: Usar usuario.Documento en lugar de req.session.Documento
        const Documento = usuario.Documento;
        
        // Verificar que la solicitud pertenece al usuario
        const [verificacion] = await connection.execute(
            'SELECT s.Id_solicitudes FROM solicitudes s INNER JOIN usuario u ON s.Id1 = u.Id WHERE s.Id_solicitudes = ? AND u.Documento = ?',
            [solicitudId, Documento]
        );
        
        if (verificacion.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Solicitud no encontrada o no pertenece al usuario'
            });
        }
        
        // Eliminar la solicitud
        await connection.execute(
            'DELETE FROM solicitudes WHERE Id_solicitudes = ?', 
            [solicitudId]
        );
        
        res.json({
            success: true,
            message: 'Solicitud eliminada exitosamente'
        });
        
    } catch (error) {
        handleDbError(error, res);
    } finally {
        if (connection) await connection.end();
    }
});

// Cerrar sesión
app.post('/api/cerrar-sesion', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error al cerrar sesión:', err);
            res.status(500).json({
                success: false,
                message: 'Error al cerrar sesión'
            });
        } else {
            res.json({
                success: true,
                message: 'Sesión cerrada correctamente'
            });
        }
    });
});

// ===== RUTAS DE ADMINISTRADOR =====

app.get('/api/administrador', verificarAdministrador, (req, res) => {
    res.json({
        success: true,
        usuario: req.session.usuario
    });
});

// === Usuarios ===
app.get('/usuarios', verificarAdministrador, async (req, res) => {
    let connection;
    try {
        connection = await mysql.createConnection(db);
        const [rows] = await connection.execute('SELECT * FROM usuario ORDER BY Id');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al obtener usuarios' 
        });
    } finally {
        if (connection) await connection.end();
    }
});

// Crear usuario (POST /usuarios)
app.post('/usuarios', verificarAdministrador, async (req, res) => {
    const { NombreUsuario, TipoDocumento, Documento, Rol, Man } = req.body;
    if (!NombreUsuario || !TipoDocumento || !Documento || !Rol || !Man) {
        return res.status(400).json({
            success: false,
            message: 'Todos los campos son requeridos'
        });
    }
    let connection;
    try {
        connection = await mysql.createConnection(db);
        // Verificar si el usuario ya existe
        const [rows] = await connection.execute(
            'SELECT * FROM usuario WHERE Documento = ? AND TipoDocumento = ?',
            [Documento, TipoDocumento]
        );
        if (rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Usuario ya existe'
            });
        }
        // Insertar nuevo usuario
        await connection.execute(
            'INSERT INTO usuario (NombreUsuario, TipoDocumento, Documento, Rol, Id_M1) VALUES (?, ?, ?, ?, ?)',
            [NombreUsuario, TipoDocumento, Documento, Rol, Man]
        );
        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            data: { NombreUsuario, TipoDocumento, Documento, Rol, Man }
        });
    } catch (error) {
        handleDbError(error, res);
    } finally {
        if (connection) await connection.end();
    }
});

app.put('/usuarios/:id', verificarAdministrador, async (req, res) => {
    const { id } = req.params;
    const { NombreUsuario, TipoDocumento, Documento, Rol, Id_M1 } = req.body;
    // ADVERTENCIA: Nunca modificar req.session.usuario aquí. Solo la ruta de login debe cambiar la sesión.
    if (!NombreUsuario || !TipoDocumento || !Documento || !Rol || !Id_M1) {
        return res.status(400).json({
            success: false,
            message: 'Todos los campos son requeridos'
        });
    }

    let connection;
    try {
        connection = await mysql.createConnection(db);
        // Verificar si el usuario existe
        const [existeUsuario] = await connection.execute(
            'SELECT Id FROM usuario WHERE Id = ?', 
            [id]
        );
        if (existeUsuario.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        // Actualizar usuario
        await connection.execute(
            'UPDATE usuario SET NombreUsuario=?, TipoDocumento=?, Documento=?, Rol=?, Id_M1=? WHERE Id=?', 
            [NombreUsuario, TipoDocumento, Documento, Rol, Id_M1, id]
        );
        res.json({ 
            success: true,
            message: 'Usuario actualizado exitosamente'
        });
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al actualizar usuario' 
        });
    } finally {
        if (connection) await connection.end();
    }
});

app.delete('/usuarios/:id', verificarAdministrador, async (req, res) => {
    const { id } = req.params;
    
    let connection;
    try {
        connection = await mysql.createConnection(db);
        
        // Verificar si el usuario existe
        const [existeUsuario] = await connection.execute(
            'SELECT Id FROM usuario WHERE Id = ?', 
            [id]
        );
        
        if (existeUsuario.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        
        // Eliminar usuario
        await connection.execute('DELETE FROM usuario WHERE Id = ?', [id]);
        
        res.json({ 
            success: true,
            message: 'Usuario eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al eliminar usuario' 
        });
    } finally {
        if (connection) await connection.end();
    }
});

// === Manzanas ===
app.get('/manzanas', verificarAdministrador, async (req, res) => {
    let connection;
    try {
        connection = await mysql.createConnection(db);
        const [rows] = await connection.execute('SELECT * FROM manzanas ORDER BY Id_M');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener manzanas:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al obtener manzanas' 
        });
    } finally {
        if (connection) await connection.end();
    }
});

// Ruta para agregar una nueva manzana (solo admin)
app.post('/manzanas', verificarAdministrador, async (req, res) => {
    const { NombreManzana, Dir } = req.body;
    if (!NombreManzana || !Dir) {
        return res.status(400).json({ success: false, message: 'Faltan campos requeridos' });
    }
    let connection;
    try {
        connection = await mysql.createConnection(db);
        const [result] = await connection.execute(
            'INSERT INTO manzanas (NombreManzana, Dir) VALUES (?, ?)',
            [NombreManzana, Dir]
        );
        res.json({ success: true, id: result.insertId });
    } catch (error) {
        console.error('Error al agregar manzana:', error);
        res.status(500).json({ success: false, message: 'Error al agregar manzana' });
    } finally {
        if (connection) await connection.end();
    }
});

app.put('/manzanas/:id', verificarAdministrador, async (req, res) => {
    const { id } = req.params;
    const { NombreManzana, Dir } = req.body;
    // ADVERTENCIA: Nunca modificar req.session.usuario aquí. Solo la ruta de login debe cambiar la sesión.
    if (!NombreManzana) {
        return res.status(400).json({
            success: false,
            message: 'El nombre es requerido'
        });
    }

    let connection;
    try {
        connection = await mysql.createConnection(db);
        // Verificar si la manzana existe
        const [existeManzana] = await connection.execute(
            'SELECT Id_M FROM manzanas WHERE Id_M = ?', 
            [id]
        );
        if (existeManzana.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Manzana no encontrada'
            });
        }
        // Actualizar manzana
        await connection.execute(
            'UPDATE manzanas SET NombreManzana=?, Dir=? WHERE Id_M=?', 
            [NombreManzana, Dir || null, id]
        );
        res.json({ 
            success: true,
            message: 'Manzana actualizada exitosamente'
        });
    } catch (error) {
        console.error('Error al actualizar manzana:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al actualizar manzana' 
        });
    } finally {
        if (connection) await connection.end();
    }
});

app.delete('/manzanas/:id', verificarAdministrador, async (req, res) => {
    const { id } = req.params;
    
    let connection;
    try {
        connection = await mysql.createConnection(db);
        
        // Verificar si la manzana existe
        const [existeManzana] = await connection.execute(
            'SELECT Id_M FROM manzanas WHERE Id_M = ?', 
            [id]
        );
        
        if (existeManzana.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Manzana no encontrada'
            });
        }
        
        // Eliminar manzana
        await connection.execute('DELETE FROM manzanas WHERE Id_M = ?', [id]);
        
        res.json({ 
            success: true,
            message: 'Manzana eliminada exitosamente'
        });
    } catch (error) {
        console.error('Error al eliminar manzana:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al eliminar manzana' 
        });
    } finally {
        if (connection) await connection.end();
    }
});

// === Servicios ===
// Crear servicio (POST /servicios)
app.post('/servicios', verificarAdministrador, async (req, res) => {
    const { NombreServicio, TipoServicio, Id_M } = req.body;
    if (!NombreServicio || !TipoServicio || !Id_M) {
        return res.status(400).json({
            success: false,
            message: 'Todos los campos son requeridos'
        });
    }
    let connection;
    try {
        connection = await mysql.createConnection(db);
        // Verificar si el servicio ya existe
        const [rows] = await connection.execute(
            'SELECT * FROM servicios WHERE NombreServicio = ?',
            [NombreServicio]
        );
        if (rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'El servicio ya existe'
            });
        }
        // Insertar nuevo servicio
        const [result] = await connection.execute(
            'INSERT INTO servicios (NombreServicio, TipoServicio) VALUES (?, ?)',
            [NombreServicio, TipoServicio]
        );
        const nuevoIdServicio = result.insertId;
        // Asociar el servicio a la manzana seleccionada
        await connection.execute(
            'INSERT INTO m_s (Id_M1, Id_S1) VALUES (?, ?)',
            [Id_M, nuevoIdServicio]
        );
        res.status(201).json({
            success: true,
            message: 'Servicio creado y asociado exitosamente',
            id: nuevoIdServicio
        });
    } catch (error) {
        handleDbError(error, res);
    } finally {
        if (connection) await connection.end();
    }
});
app.get('/servicios', verificarAdministrador, async (req, res) => {
    let connection;
    try {
        connection = await mysql.createConnection(db);
        const [rows] = await connection.execute('SELECT * FROM servicios ORDER BY Id_S');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener servicios:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al obtener servicios' 
        });
    } finally {
        if (connection) await connection.end();
    }
});

app.put('/servicios/:id', verificarAdministrador, async (req, res) => {
    const { id } = req.params;
    const { NombreServicio, TipoServicio } = req.body;
    // ADVERTENCIA: Nunca modificar req.session.usuario aquí. Solo la ruta de login debe cambiar la sesión.
    if (!NombreServicio) {
        return res.status(400).json({
            success: false,
            message: 'El nombre es requerido'
        });
    }

    let connection;
    try {
        connection = await mysql.createConnection(db);
        // Verificar si el servicio existe
        const [existeServicio] = await connection.execute(
            'SELECT Id_S FROM servicios WHERE Id_S = ?', 
            [id]
        );
        if (existeServicio.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Servicio no encontrado'
            });
        }
        // Actualizar servicio
        await connection.execute(
            'UPDATE servicios SET NombreServicio=?, TipoServicio=? WHERE Id_S=?', 
            [NombreServicio, TipoServicio || null, id]
        );
        res.json({ 
            success: true,
            message: 'Servicio actualizado exitosamente'
        });
    } catch (error) {
        console.error('Error al actualizar servicio:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al actualizar servicio' 
        });
    } finally {
        if (connection) await connection.end();
    }
});

app.delete('/servicios/:id', verificarAdministrador, async (req, res) => {
    const { id } = req.params;
    
    let connection;
    try {
        connection = await mysql.createConnection(db);
        
        // Verificar si el servicio existe
        const [existeServicio] = await connection.execute(
            'SELECT Id_S FROM servicios WHERE Id_S = ?', 
            [id]
        );
        
        if (existeServicio.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Servicio no encontrado'
            });
        }
        
        // Eliminar servicio
        await connection.execute('DELETE FROM servicios WHERE Id_S = ?', [id]);
        
        res.json({ 
            success: true,
            message: 'Servicio eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error al eliminar servicio:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al eliminar servicio' 
        });
    } finally {
        if (connection) await connection.end();
    }
});

// === Solicitudes ===
app.get('/solicitudes', verificarAdministrador, async (req, res) => {
  let connection;
  try {
    connection = await mysql.createConnection(db);
    // CONSULTA CORREGIDA: agrupa solo por Id_solicitudes para evitar duplicados
    const [rows] = await connection.execute(`
      SELECT 
        s.Id_solicitudes,
        MAX(s.Fecha) as Fecha,
        s.Id1,
        s.CodigoS as Id_S,
        MAX(srv.NombreServicio) as Servicio,
        MAX(u.NombreUsuario) as Usuario
      FROM solicitudes s
      INNER JOIN servicios srv ON s.CodigoS = srv.Id_S
      INNER JOIN usuario u ON s.Id1 = u.Id
      GROUP BY s.Id_solicitudes
      ORDER BY s.Id_solicitudes DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener solicitudes:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener solicitudes' 
    });
  } finally {
    if (connection) await connection.end();
  }
});

app.delete('/solicitudes/:id', verificarAdministrador, async (req, res) => {
    const { id } = req.params;
    
    let connection;
    try {
        connection = await mysql.createConnection(db);
        
        // Verificar si la solicitud existe
        const [existeSolicitud] = await connection.execute(
            'SELECT Id_solicitudes FROM solicitudes WHERE Id_solicitudes = ?', 
            [id]
        );
        
        if (existeSolicitud.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Solicitud no encontrada'
            });
        }
        
        // Eliminar solicitud
        await connection.execute('DELETE FROM solicitudes WHERE Id_solicitudes=?', [id]);
        
        res.json({ 
            success: true,
            message: 'Solicitud eliminada exitosamente'
        });
    } catch (error) {
        console.error('Error al eliminar solicitud:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al eliminar solicitud' 
        });
    } finally {
        if (connection) await connection.end();
    }
});

app.post('/solicitudes', async (req, res) => {
    const { Id1, Id_S, Fecha } = req.body;

    let connection;
    try {
        connection = await mysql.createConnection(db);

        // Validación básica
        if (!Id1 || !Id_S || !Fecha) {
            return res.status(400).json({
                success: false,
                message: 'Faltan datos obligatorios: Id1, Id_S o Fecha'
            });
        }

        const [result] = await connection.execute(
            `INSERT INTO solicitudes (Id1, CodigoS, Fecha)
             VALUES (?, ?, ?)`,
            [Id1, Id_S, Fecha,]
        );

        if (result.affectedRows === 1) {
            res.status(201).json({
                success: true,
                message: 'Solicitud creada correctamente',
                id: result.insertId
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'No se pudo crear la solicitud'
            });
        }
    } catch (error) {
        console.error('Error al crear solicitud:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno al crear la solicitud'
        });
    } finally {
        if (connection) await connection.end();
    }
});

app.put('/solicitudes/:id', verificarAdministrador, async (req, res) => {
    const { id } = req.params;
    const { NombreServicio, Fecha } = req.body;
    // ADVERTENCIA: Nunca modificar req.session.usuario aquí. Solo la ruta de login debe cambiar la sesión.
    if (!NombreServicio || !Fecha) {
        return res.status(400).json({
            success: false,
            message: 'Todos los campos son requeridos'
        });
    }
    let connection;
    try {
        connection = await mysql.createConnection(db);
        // Verificar si la solicitud existe
        const [existeSolicitud] = await connection.execute(
            'SELECT Id_solicitudes FROM solicitudes WHERE Id_solicitudes = ?', 
            [id]
        );
        if (existeSolicitud.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Solicitud no encontrada'
            });
        }
        // Obtener ID del servicio por nombre
        const [servicioRows] = await connection.execute(
            'SELECT Id_S FROM servicios WHERE NombreServicio = ?', 
            [NombreServicio]
        );
        if (servicioRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Servicio no encontrado'
            });
        }
        // Actualizar solo el servicio y la fecha de la solicitud
        await connection.execute(
            'UPDATE solicitudes SET CodigoS = ?, Fecha = ? WHERE Id_solicitudes = ?',
            [servicioRows[0].Id_S, Fecha, id]
        );
        res.json({ 
            success: true,
            message: 'Solicitud actualizada exitosamente'
        });
    } catch (error) {
        console.error('Error al actualizar solicitud:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al actualizar solicitud' 
        });
    } finally {
        if (connection) await connection.end();
    }
});

// Obtener servicios asociados a la manzana del usuario autenticado
app.get('/servicios-usuario', async (req, res) => {
  let connection;
  try {
    if (!req.session.usuario || !req.session.usuario.Id_M1) {
      return res.status(401).json({ success: false, message: 'No autorizado o manzana no definida' });
    }
    const idManzana = req.session.usuario.Id_M1;
    connection = await mysql.createConnection(db);
    const [servicios] = await connection.execute(
      `SELECT s.Id_S, s.NombreServicio, s.TipoServicio
       FROM servicios s
       JOIN m_s ON s.Id_S = m_s.Id_S1
       WHERE m_s.Id_M1 = ?`,
      [idManzana]
    );
    res.json({ success: true, data: servicios });
  } catch (error) {
    console.error('Error al obtener servicios del usuario:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  } finally {
    if (connection) await connection.end();
  }
});

// Ruta para verificar el estado del servidor
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Servidor funcionando correctamente',
        timestamp: new Date().toISOString()
    });
});

// Mantener compatibilidad con rutas antiguas
app.get('/obtener-usuario', (req, res) => {
    const usuario = req.session.usuario;
    if (usuario) {
        res.json({ NombreUsuario: usuario });
    } else {
        res.status(401).send('Usuario no autenticado');
    }
});

app.post('/obtener-servicios-usuario', async (req, res) => {
    res.redirect(307, '/api/servicios-disponibles');
});

app.post('/obtener-servicios-guardados', async (req, res) => {
    res.redirect(307, '/api/mis-solicitudes');
});

app.listen(5000, () => {
    console.log('Servidor corriendo en puerto 5000');
});