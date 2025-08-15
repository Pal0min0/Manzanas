import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/css/usuario.css';

const API_BASE_URL = 'http://localhost:5000';

const Usuario = () => {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState(null);
  const [tab, setTab] = useState('servicios');
  const [servicios, setServicios] = useState([]);
  const [misSolicitudes, setMisSolicitudes] = useState([]);
  const [servicioSeleccionado, setServicioSeleccionado] = useState('');
  const [fechaHora, setFechaHora] = useState('');

  const manzanas = { 
    '1': 'Bosa', 
    '2': 'Suba', 
    '3': 'Chapinero',
    '4': 'Kennedy',
    '5': 'Engativá',
    '6': 'Fontibón',
    '7': 'Barrios Unidos',
    '8': 'Teusaquillo',
    '9': 'Los Mártires',
    '10': 'Antonio Nariño',
    '11': 'Puente Aranda',
    '12': 'La Candelaria',
    '13': 'Rafael Uribe Uribe',
    '14': 'Ciudad Bolívar',
    '15': 'San Cristóbal',
    '16': 'Usme',
    '17': 'Tunjuelito',
    '18': 'Bosa',
    '19': 'Sumapaz'
  };

  useEffect(() => {
    verificarSesion();
    cargarServiciosDisponibles();
    cargarMisSolicitudes();
  }, []);

  const verificarSesion = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/usuario`, { credentials: 'include' });
      const result = await response.json();
      if (result.success) {
        setUsuario(result.data);
      } else {
        alert('No hay sesión activa. Redirigiendo...');
        navigate('/');
      }
    } catch {
      alert('Error al verificar sesión');
      navigate('/');
    }
  };

  const cerrarSesion = async () => {
    if (!window.confirm('¿Desea cerrar sesión?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/cerrar-sesion`, {
        method: 'POST',
        credentials: 'include'
      });
      const result = await response.json();
      if (result.success) {
        alert('Sesión cerrada');
        navigate('/');
      } else {
        alert('Error al cerrar sesión');
      }
    } catch {
      alert('Error de conexión al cerrar sesión');
    }
  };

 const cargarServiciosDisponibles = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/servicios-por-manzana`, { credentials: 'include' });
    const data = await res.json();
    
    if (data.success && Array.isArray(data.data)) {
      setServicios(data.data);
    } else {
      setServicios([]);
    }
  } catch (error) {
    console.error('Error cargando servicios:', error);
    setServicios([]);
  }
};

  const cargarMisSolicitudes = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/mis-solicitudes`, { credentials: 'include' });
      const result = await res.json();
      if (result.success) setMisSolicitudes(result.data);
      else setMisSolicitudes([]);
    } catch {
      alert('Error cargando solicitudes');
    }
  };

  const solicitarServicio = async (e) => {
    e.preventDefault();
    if (!servicioSeleccionado || !fechaHora) {
      return alert('Complete todos los campos');
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/solicitar-servicio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ servicios: servicioSeleccionado, fechaHora }),
      });
      const result = await res.json();
      if (result.success) {
        alert('Solicitud enviada');
        setServicioSeleccionado('');
        setFechaHora('');
        cargarMisSolicitudes();
      } else {
        alert('Error: ' + result.message);
      }
    } catch {
      alert('Error al enviar solicitud');
    }
  };

  const eliminarSolicitud = async (id) => {
    if (!window.confirm('¿Eliminar esta solicitud?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/solicitudes/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const result = await res.json();
      if (result.success) {
        alert('Solicitud eliminada');
        cargarMisSolicitudes();
      } else {
        alert('Error: ' + result.message);
      }
    } catch {
      alert('Error al eliminar solicitud');
    }
  };

  return (
    <div className='usuario-main'>
      <div className="contenedor-usuario">
        {/* HEADER */}
        <header className="contenedor-header">     
          <h1 className="titulo-bienvenida">Bienvenido(a) {usuario ? usuario.NombreUsuario : ''}</h1>
          <button 
            className="boton-cerrar" 
            onClick={cerrarSesion}
            aria-label="Cerrar sesión"
          >
            Cerrar Sesión
          </button>
        </header>

        {/* INFORMACIÓN DEL USUARIO */}
        <section className="info-usuario" aria-labelledby="user-info-heading">
          <h2 id="user-info-heading" className="titulo-seccion">Información de la cuenta</h2>
          {usuario ? (
            <div className="detalles-usuario">
              <p className="detalle-usuario"><strong>Identificación:</strong> {usuario.Id}</p>
              <p className="detalle-usuario"><strong>Nombre:</strong> {usuario.NombreUsuario}</p>
              <p className="detalle-usuario"><strong>Documento:</strong> {usuario.Documento}</p>
              <p className="detalle-usuario"><strong>Rol:</strong> {usuario.Rol}</p>
              <p className="detalle-usuario"><strong>Manzana:</strong> {manzanas[String(usuario.Id_M1)] ? `${manzanas[String(usuario.Id_M1)]} (${usuario.Id_M1})` : usuario.Id_M1}</p>
            </div>
          ) : (
            <p className="usuario-cargando"><strong>Cargando información...</strong></p>
          )}
        </section>

        {/* NAVEGACIÓN */}
        <nav className="botones-secciones" aria-label="Navegación de secciones">
          <div className="contenedor-botones">
            <button 
              className={`boton-seccion ${tab === 'servicios' ? 'activo' : ''}`} 
              onClick={() => setTab('servicios')}
              aria-current={tab === 'servicios' ? 'page' : undefined}
            >
              Servicios Disponibles
            </button>
            <button 
              className={`boton-seccion ${tab === 'solicitar' ? 'activo' : ''}`} 
              onClick={() => setTab('solicitar')}
              aria-current={tab === 'solicitar' ? 'page' : undefined}
            >
              Solicitar Servicio
            </button>
            <button 
              className={`boton-seccion ${tab === 'historial' ? 'activo' : ''}`} 
              onClick={() => setTab('historial')}
              aria-current={tab === 'historial' ? 'page' : undefined}
            >
              Mis Solicitudes
            </button>
          </div>
        </nav>

        {/* CONTENIDO PRINCIPAL */}
        <main className="seccion">
          <div className="seccion-contenido">
            {/* Servicios Disponibles */}
            {tab === 'servicios' && (
              <div className="usuario-servicios">
                <h3 className="usuario-servicios-titulo">Servicios Disponibles</h3>
                {servicios.length > 0 ? (
                  <ul className="usuario-servicios-lista">
                    {servicios.map((servicio) => (
                      <li key={servicio.Id_S} className="usuario-servicio">
                        <div className="servicio-nombre">{servicio.NombreServicio}</div>
                        <div className="servicio-tipo">{servicio.TipoServicio}</div>
                        <div className="servicio-descripcion">
                          Servicio disponible para tu manzana
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="usuario-cargando">Cargando servicios...</p>
                )}
              </div>
            )}

            {/* Solicitar Servicio */}
            {tab === 'solicitar' && (
              <div className="usuario-servicios">
                <h3 className="usuario-servicios-titulo">Solicitar Servicio</h3>
                <form onSubmit={solicitarServicio} style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
                  <div className="campo-formulario">
                    <label className="campo-formulario-label">Servicio:</label>
                    <select
                      className="campo-formulario-select"
                      value={servicioSeleccionado}
                      onChange={(e) => setServicioSeleccionado(e.target.value)}
                      required
                    >
                      <option value="">Seleccionar servicio</option>
                      {servicios.map((servicio) => (
                        <option key={servicio.Id_S} value={servicio.Id_S}>
                          {servicio.NombreServicio}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="campo-formulario">
                    <label className="campo-formulario-label">Fecha y Hora:</label>
                    <input
                      type="datetime-local"
                      className="campo-formulario-input"
                      value={fechaHora}
                      onChange={(e) => setFechaHora(e.target.value)}
                      required
                    />
                  </div>
                  <div className="formulario-botones">
                    <button type="submit" className="boton-guardar">
                      Solicitar Servicio
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Mis Solicitudes */}
            {tab === 'historial' && (
              <div className="usuario-servicios">
                <h3 className="usuario-servicios-titulo">Mis Solicitudes</h3>
                {misSolicitudes.length > 0 ? (
                  <ul className="usuario-servicios-lista">
                    {misSolicitudes.map((solicitud) => (
                      <li key={solicitud.id} className="usuario-servicio">
                        <div className="servicio-nombre">{solicitud.NombreServicio}</div>
                        <div className="servicio-fecha">Fecha: {solicitud.fecha}</div>
                        <div className="servicio-fecha">Identificación: {solicitud.id}</div>
                        <button
                          onClick={() => eliminarSolicitud(solicitud.id)}
                          className="boton-accion"
                          style={{ backgroundColor: '#e74c3c', marginTop: '10px' }}
                        >
                          ELIMINAR
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="usuario-cargando">No tienes solicitudes pendientes</p>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Usuario;
