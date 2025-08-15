import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/css/administrador.css';

const API_BASE_URL = 'http://localhost:5000';

function Administrador() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [seccionActiva, setSeccionActiva] = useState('usuarios');

  const [usuarios, setUsuarios] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [manzanas, setManzanas] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [formularioVisible, setFormularioVisible] = useState(false);
  const [tipoActualizar, setTipoActualizar] = useState('');
  const [elementos, setElementos] = useState([]);
  
  const [elementoEditando, setElementoEditando] = useState(null);
  const [datosFormulario, setDatosFormulario] = useState({});
  const [modoFormulario, setModoFormulario] = useState('editar');

  // Cargar manzanas automáticamente
  useEffect(() => {
    if (manzanas.length === 0) {
      cargarManzanas();
    }
  }, []);

  useEffect(() => {
    async function obtenerSesion() {
      try {
        const respuesta = await fetch('http://localhost:5000/api/administrador', {
          method: 'GET',
          credentials: 'include',
        });

        if (respuesta.ok) {
          const datos = await respuesta.json();

          if (datos.usuario?.Rol !== 'administrador') {
            navigate('/usuario');
          } else {
            setUsuario(datos.usuario);
          }
        } else {
          navigate('/ingresar');
        }
      } catch (error) {
        console.error('Error al obtener sesión:', error);
        navigate('/ingresar');
      }
    }

    obtenerSesion();
  }, [navigate]);

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

  const cargarUsuarios = async () => {
    try {
      const res = await fetch('http://localhost:5000/usuarios', {
        credentials: 'include'
      });
      const data = await res.json();
      setUsuarios(data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    }
  };

  const cargarServicios = async () => {
    try {
      const res = await fetch('http://localhost:5000/servicios-usuario', {
        credentials: 'include'
      });
      const data = await res.json();
      setServicios(data.data || []);
    } catch (error) {
      console.error('Error al cargar servicios:', error);
    }
  };

  const cargarManzanas = async () => {
    try {
      const res = await fetch('http://localhost:5000/manzanas', {
        credentials: 'include'
      });
      const data = await res.json();
      setManzanas(data);
    } catch (error) {
      console.error('Error al cargar manzanas:', error);
    }
  };

  const cargarSolicitudes = async () => {
    try {
      const res = await fetch('http://localhost:5000/solicitudes', {
        credentials: 'include'
      });
      
      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      
      const solicitudesProcesadas = data.map(solicitud => ({
        ...solicitud,
        FechaFormateada: new Date(solicitud.Fecha).toLocaleString('es-ES', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      }));
      
      setSolicitudes(solicitudesProcesadas);
      
    } catch (error) {
      console.error('Error al cargar solicitudes:', error);
      setSolicitudes([]);
    }
  };

  if (!usuario) {
    return <div className="administrador-main">Cargando datos del administrador...</div>;
  }

  const abrirModal = async (tipo) => {
    setTipoActualizar(tipo);
    setModalVisible(true);
    
    try {
      let url = '';
      if (tipo === 'usuarios') url = '/usuarios';
      if (tipo === 'servicios') url = '/servicios';
      if (tipo === 'manzanas') url = '/manzanas';
      if (tipo === 'solicitudes') url = '/solicitudes';

      const res = await fetch(`${API_BASE_URL}${url}`, {
        credentials: 'include',
      });
      const data = await res.json();

      if (!Array.isArray(data)) {
        alert(data.message || 'No autorizado o sesión expirada. Vuelve a ingresar.');
        setModalVisible(false);
        setElementos([]);
        return;
      }

      if (tipo === 'solicitudes') {
        const solicitudesProcesadas = data.map(solicitud => ({
          ...solicitud,
          FechaFormateada: new Date(solicitud.Fecha).toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })
        }));
        setElementos(solicitudesProcesadas || []);
      } else {
        setElementos(data || []);
      }
    } catch (error) {
      console.error('Error al cargar datos para modal:', error);
      setElementos([]);
    }
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setElementos([]);
  };

  const cerrarFormulario = () => {
    setFormularioVisible(false);
    setElementoEditando(null);
    setDatosFormulario({});
    setModoFormulario('editar');
  };

  const abrirFormularioAgregar = (tipo) => {
    setTipoActualizar(tipo);
    setElementoEditando(null);
    setFormularioVisible(true);
    setModoFormulario('agregar');
    
    if (tipo === 'solicitudes' && servicios.length === 0) {
      cargarServicios();
    }
    if (tipo === 'solicitudes' && usuarios.length === 0) {
      cargarUsuarios();
    }
    
    if (tipo === 'usuarios') {
      setDatosFormulario({
        NombreUsuario: '',
        TipoDocumento: '',
        Documento: '',
        Id_M1: '',
        Rol: ''
      });
    } else if (tipo === 'servicios') {
      setDatosFormulario({
        NombreServicio: '',
        TipoServicio: ''
      });
    } else if (tipo === 'manzanas') {
      setDatosFormulario({
        NombreManzana: '',
        Dir: ''
      });
    } else if (tipo === 'solicitudes') {
      setDatosFormulario({
        Id1: '',
        Id_S: '',
        Fecha: ''
      });
    }
  };

  const abrirFormularioEdicion = async (elemento) => {
    setElementoEditando(elemento);
    setModalVisible(false);
    setFormularioVisible(true);
    setModoFormulario('editar');
    
    let tipo = '';
    if ('Id_solicitudes' in elemento) tipo = 'solicitudes';
    else if ('Id' in elemento) tipo = 'usuarios';
    else if ('Id_M' in elemento) tipo = 'manzanas';
    else if ('Id_S' in elemento || 'CodigoS' in elemento) tipo = 'servicios';

    if (tipo === 'solicitudes' && servicios.length === 0) {
      await cargarServicios();
    }

    if (tipo === 'usuarios') {
      setDatosFormulario({
        Id: elemento.Id,
        NombreUsuario: elemento.NombreUsuario || '',
        TipoDocumento: elemento.TipoDocumento || '',
        Documento: elemento.Documento || '',
        Id_M1: elemento.Id_M1 || '',
        Rol: elemento.Rol || ''
      });
    } else if (tipo === 'servicios') {
      setDatosFormulario({
        Id_S: elemento.Id_S || elemento.CodigoS || '',
        NombreServicio: elemento.NombreServicio || '',
        TipoServicio: elemento.TipoServicio || ''
      });
    } else if (tipo === 'manzanas') {
      setDatosFormulario({
        Id_M: elemento.Id_M,
        NombreManzana: elemento.NombreManzana || '',
        Dir: elemento.Dir || ''
      });
    } else if (tipo === 'solicitudes') {
      let fechaFormateada = '';
      if (elemento.Fecha) {
        const d = new Date(elemento.Fecha);
        fechaFormateada = d.toISOString().slice(0, 16);
      }
      setDatosFormulario({
        Id_solicitudes: elemento.Id_solicitudes,
        Id_S: elemento.Id_S || '',
        Fecha: fechaFormateada,
      });
    }
    setTipoActualizar(tipo);
  };

  const obtenerIdElemento = (elemento) => {
    return elemento.Id || elemento.Id_S || elemento.CodigoS || elemento.Id_solicitudes || elemento.Id_M;
  };

  const obtenerNombreElemento = (elemento) => {
    if (tipoActualizar === 'solicitudes') {
      return `${elemento.Usuario} - ${elemento.Servicio} - ${elemento.FechaFormateada}`;
    }
    return elemento.NombreUsuario || elemento.NombreServicio || elemento.NombreManzana || '';
  };

  const eliminarElemento = async (el) => {
    if (!window.confirm('¿Seguro que deseas eliminar este elemento?')) return;
    
    try {
      let url = '';
      let id = '';

      if (tipoActualizar === 'usuarios') {
        id = el.Id;
        url = `/usuarios/${id}`;
      }
      if (tipoActualizar === 'servicios') {
        id = el.Id_S;
        url = `/servicios/${id}`;
      }
      if (tipoActualizar === 'manzanas') {
        id = el.Id_M;
        url = `/manzanas/${id}`;
      }
      if (tipoActualizar === 'solicitudes') {
        id = el.Id_solicitudes;
        url = `/solicitudes/${id}`;
      }

      const res = await fetch(`${API_BASE_URL}${url}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (res.ok) {
        alert('Elemento eliminado');
        await abrirModal(tipoActualizar);
      } else {
        alert('Error al eliminar');
      }
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert('Error al eliminar elemento');
    }
  };

  const FormularioEdicion = () => {
    const esEditar = modoFormulario === 'editar';
    const refNombreUsuario = useRef();
    const refTipoDocumento = useRef();
    const refDocumento = useRef();
    const refManzana = useRef();
    const refRol = useRef();
    const refNombreServicio = useRef();
    const refTipoServicio = useRef();
    const refManzanaServicio = useRef();
    const refNombreManzana = useRef();
    const refDir = useRef();
    const refServicioSolicitud = useRef();
    const refFechaSolicitud = useRef();

    if (!formularioVisible) return null;

    const guardarNoControlado = async () => {
      let body = {};
      let url = '';
      let id = '';
      let method = 'PUT';
      
      if (modoFormulario === 'agregar') {
        if (tipoActualizar === 'usuarios') {
          url = `/usuarios`;
          body = {
            NombreUsuario: refNombreUsuario.current.value,
            TipoDocumento: refTipoDocumento.current.value,
            Documento: refDocumento.current.value,
            Man: refManzana.current.value,
            Rol: refRol.current.value
          };
          method = 'POST';
        } else if (tipoActualizar === 'servicios') {
          url = `/servicios`;
          body = {
            NombreServicio: refNombreServicio.current.value,
            TipoServicio: refTipoServicio.current.value,
            Id_M: refManzanaServicio.current.value
          };
          method = 'POST';
        } else if (tipoActualizar === 'manzanas') {
          url = `/manzanas`;
          body = {
            NombreManzana: refNombreManzana.current.value,
            Dir: refDir.current.value
          };
          method = 'POST';
        } else if (tipoActualizar === 'solicitudes') {
          let fechaFormateada = '';
          if (refFechaSolicitud.current.value) {
            const d = new Date(refFechaSolicitud.current.value);
            const pad = n => n.toString().padStart(2, '0');
            fechaFormateada = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
          }
          url = `/solicitudes`;
          body = {
            Id1: usuario.Id,
            Id_S: refServicioSolicitud.current.value,
            Fecha: fechaFormateada
          };
          method = 'POST';
        }
      } else {
        if (tipoActualizar === 'usuarios') {
          id = elementoEditando?.Id;
          url = `/usuarios/${id}`;
          body = {
            NombreUsuario: refNombreUsuario.current.value,
            TipoDocumento: refTipoDocumento.current.value,
            Documento: refDocumento.current.value,
            Id_M1: refManzana.current.value,
            Rol: refRol.current.value
          };
        } else if (tipoActualizar === 'servicios') {
          id = elementoEditando?.Id_S || elementoEditando?.CodigoS;
          url = `/servicios/${id}`;
          body = {
            NombreServicio: refNombreServicio.current.value,
            TipoServicio: refTipoServicio.current.value,
            Id_M: refManzanaServicio.current.value
          };
        } else if (tipoActualizar === 'manzanas') {
          id = elementoEditando?.Id_M;
          url = `/manzanas/${id}`;
          body = {
            NombreManzana: refNombreManzana.current.value,
            Dir: refDir.current.value
          };
        } else if (tipoActualizar === 'solicitudes') {
          id = elementoEditando?.Id_solicitudes;
          url = `/solicitudes/${id}`;
          let fechaFormateada = '';
          if (refFechaSolicitud.current.value) {
            const d = new Date(refFechaSolicitud.current.value);
            const pad = n => n.toString().padStart(2, '0');
            fechaFormateada = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
          }
          const idServicioSeleccionado = refServicioSolicitud.current.value;
          const nombreServicio = servicios.find(s => String(s.Id_S) === String(idServicioSeleccionado))?.NombreServicio || '';
          body = {
            NombreServicio: nombreServicio,
            Fecha: fechaFormateada
          };
        }
        method = 'PUT';
      }
      
      try {
        const response = await fetch(`${API_BASE_URL}${url}`, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(body)
        });
        
        let data = {};
        try {
          data = await response.json();
        } catch (e) {
          data = { message: 'Respuesta no es JSON', raw: await response.text() };
        }
        
        if (response.ok && data.success) {
          alert(modoFormulario === 'agregar' ? 'Elemento agregado exitosamente' : 'Cambios guardados exitosamente');
          cerrarFormulario();
          await abrirModal(tipoActualizar);
          if (tipoActualizar === 'usuarios') await cargarUsuarios();
          if (tipoActualizar === 'servicios') await cargarServicios();
          if (tipoActualizar === 'manzanas') await cargarManzanas();
          if (tipoActualizar === 'solicitudes') await cargarSolicitudes();
        } else {
          alert(`Error: ${data.message || data.raw || 'Error desconocido'}`);
          console.error('Error backend:', data);
        }
      } catch (error) {
        alert('Error al conectar con el servidor');
        console.error('Error fetch:', error);
      }
    };

    return (
      <div className="modal-overlay">
        <div className="formulario-edicion">
          <div className="formulario-contenido">
            <h3 className="formulario-titulo">
              {esEditar
                ? `Editar ${tipoActualizar.slice(0, -1)} - ID: ${elementoEditando ? obtenerIdElemento(elementoEditando) : ''}`
                : `Agregar ${tipoActualizar.slice(0, -1)}`}
            </h3>

            {tipoActualizar === 'usuarios' && (
              <>
                <div className="campo-formulario">
                  <label>Nombre:</label>
                  <input
                    type="text"
                    defaultValue={datosFormulario.NombreUsuario || ''}
                    ref={refNombreUsuario}
                    placeholder="Nombre del usuario"
                    autoFocus
                  />
                </div>
                <div className="campo-formulario">
                  <label>Tipo de documento:</label>
                  <select
                    defaultValue={datosFormulario.TipoDocumento || ''}
                    ref={refTipoDocumento}
                  >
                    <option value="">Seleccionar tipo</option>
                    <option value="CC">Cédula de Ciudadanía</option>
                    <option value="TI">Tarjeta de Identidad</option>
                    <option value="CE">Cédula de Extranjería</option>
                  </select>
                </div>
                <div className="campo-formulario">
                  <label>Documento:</label>
                  <input
                    type="text"
                    defaultValue={datosFormulario.Documento || ''}
                    ref={refDocumento}
                    placeholder="Número de documento"
                  />
                </div>
                <div className="campo-formulario">
                  <label>Manzana:</label>
                  <select
                    defaultValue={datosFormulario.Id_M1 || ''}
                    ref={refManzana}
                  >
                    <option value="">Seleccionar manzana</option>
                    {manzanas.map((m) => (
                      <option key={m.Id_M} value={m.Id_M}>{m.NombreManzana}</option>
                    ))}
                  </select>
                </div>
                <div className="campo-formulario">
                  <label>Rol:</label>
                  <select
                    defaultValue={datosFormulario.Rol || ''}
                    ref={refRol}
                  >
                    <option value="">Seleccionar rol</option>
                    <option value="usuario">Usuario</option>
                    <option value="administrador">Administrador</option>
                  </select>
                </div>
              </>
            )}

            {tipoActualizar === 'servicios' && (
              <>
                <div className="campo-formulario">
                  <label>Nombre servicio:</label>
                  <input
                    type="text"
                    defaultValue={datosFormulario.NombreServicio || ''}
                    ref={refNombreServicio}
                    placeholder="Nombre del servicio"
                    autoFocus
                  />
                </div>
                <div className="campo-formulario">
                  <label>Tipo del servicio:</label>
                  <input
                    type="text"
                    defaultValue={datosFormulario.TipoServicio || ''}
                    ref={refTipoServicio}
                    placeholder="Tipo del servicio"
                  />
                </div>
                <div className="campo-formulario">
                  <label>Asociar a manzana:</label>
                  <select ref={refManzanaServicio} defaultValue="">
                    <option value="">Seleccionar manzana</option>
                    {manzanas.map((m) => (
                      <option key={m.Id_M} value={m.Id_M}>{m.NombreManzana}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {tipoActualizar === 'manzanas' && (
              <>
                <div className="campo-formulario">
                  <label>Nombre de la manzana:</label>
                  <input
                    type="text"
                    defaultValue={datosFormulario.NombreManzana || ''}
                    ref={refNombreManzana}
                    placeholder="Nombre de la manzana"
                    autoFocus
                  />
                </div>
                <div className="campo-formulario">
                  <label>Dirección:</label>
                  <textarea
                    defaultValue={datosFormulario.Dir || ''}
                    ref={refDir}
                    placeholder="Dirección de la manzana"
                    rows="4"
                  />
                </div>
              </>
            )}

            {tipoActualizar === 'solicitudes' && (
              <>
                <div className="campo-formulario">
                  <label>Nombre servicio:</label>
                  <select
                    defaultValue={datosFormulario.Id_S || ''}
                    ref={refServicioSolicitud}
                    autoFocus
                  >
                    <option value="">Seleccionar servicio</option>
                    {servicios.map((serv) => (
                      <option key={serv.Id_S} value={serv.Id_S}>{serv.NombreServicio}</option>
                    ))}
                  </select>
                </div>
                <div className="campo-formulario">
                  <label>Fecha:</label>
                  <input
                    type="datetime-local"
                    defaultValue={datosFormulario.Fecha || ''}
                    ref={refFechaSolicitud}
                  />
                </div>
              </>
            )}

            <div className="admin-formulario-botones">
              <button className="boton-guardar" onClick={guardarNoControlado}>
                {esEditar ? 'Guardar Cambios' : 'Agregar'}
              </button>
              <button className="boton-cancelar" onClick={cerrarFormulario}>
                Regresar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="administrador-main">
      <div className="contenedor-administrador">
        <header className="contenedor-header">
          <h2 className="titulo-bienvenida">
            Bienvenido(a) {usuario.NombreUsuario}, al
            panel de administrador:
          </h2>
          <button className="boton-cerrar" onClick={cerrarSesion}>
            Cerrar sesión
          </button>
        </header>

        <section className="info-usuario">
          <h3 className="titulo-seccion">Información de la cuenta:</h3>
          <div className="detalles-usuario">
            <p className="detalle-usuario"><strong>Nombre:</strong> {usuario.NombreUsuario}</p>
            <p className="detalle-usuario"><strong>Tipo de documento:</strong> {usuario.TipoDocumento}</p>
            <p className="detalle-usuario"><strong>Documento:</strong> {usuario.Documento}</p>
            <p className="detalle-usuario"><strong>Rol:</strong> {usuario.Rol}</p>
          </div>
        </section>

        <nav className="botones-secciones">
          <div className="contenedor-botones">
            <button
              className={`boton-seccion ${seccionActiva === 'usuarios' ? 'activo' : ''}`}
              onClick={() => setSeccionActiva('usuarios')}
            >
              Usuarios
            </button>
            <button
              className={`boton-seccion ${seccionActiva === 'servicios' ? 'activo' : ''}`}
              onClick={() => setSeccionActiva('servicios')}
            >
              Servicios
            </button>
            <button
              className={`boton-seccion ${seccionActiva === 'manzanas' ? 'activo' : ''}`}
              onClick={() => setSeccionActiva('manzanas')}
            >
              Manzanas
            </button>
            <button
              className={`boton-seccion ${seccionActiva === 'solicitudes' ? 'activo' : ''}`}
              onClick={() => setSeccionActiva('solicitudes')}
            >
              Solicitudes
            </button>
          </div>
        </nav>

        <main className="seccion">
          {seccionActiva === 'usuarios' && (
            <section className="seccion-contenido seccion-usuarios">
              <h3 className="titulo-gestion">Gestión de Usuarios</h3>
              <div className="contenedor-botones-accion">
                <button className="boton-accion" onClick={() => abrirModal('usuarios')}>
                  Actualizar 
                </button>
                <button className="boton-accion" onClick={() => abrirFormularioAgregar('usuarios')}>
                  Agregar
                </button>
              </div>
            </section>
          )}

          {seccionActiva === 'servicios' && (
            <section className="seccion-contenido seccion-servicios">
              <h3 className="titulo-gestion">Gestión de Servicios</h3>
              <div className="contenedor-botones-accion">
                <button className="boton-accion" onClick={() => abrirModal('servicios')}>
                  Actualizar 
                </button>
                <button className="boton-accion" onClick={() => abrirFormularioAgregar('servicios')}>
                  Agregar
                </button>
              </div>
            </section>
          )}

          {seccionActiva === 'manzanas' && (
            <section className="seccion-contenido seccion-manzanas">
              <h3 className="titulo-gestion">Gestión de Manzanas</h3>
              <div className="contenedor-botones-accion">
                <button className="boton-accion" onClick={() => abrirModal('manzanas')}>
                  Actualizar 
                </button>
                <button className="boton-accion" onClick={() => abrirFormularioAgregar('manzanas')}>
                  Agregar
                </button>
              </div>
            </section>
          )}

          {seccionActiva === 'solicitudes' && (
            <section className="seccion-contenido seccion-solicitudes">
              <h3 className="titulo-gestion">Gestión de Solicitudes</h3>
              <div className="contenedor-botones-accion">
                <button className="boton-accion" onClick={() => abrirModal('solicitudes')}>
                  Actualizar 
                </button>
                <button className="boton-accion" onClick={() => abrirFormularioAgregar('solicitudes')}>
                  Agregar
                </button>
              </div>
            </section>
          )}
        </main>
      </div>

      {modalVisible && (
        <div className="modal-overlay">
          <div className="modal-contenido">
            <h3 className="modal-titulo">Editar o Eliminar {tipoActualizar}</h3>

            {elementos.length === 0 ? (
              <p className="modal-mensaje">No hay elementos para mostrar</p>
            ) : (
              <ul className="modal-lista">
                {elementos.map((el, idx) => {
                  const id = obtenerIdElemento(el);
                  
                  if (!id) {
                    console.warn('Elemento sin ID válido:', el);
                    return null;
                  }

                  return (
                    <li key={`modal-${tipoActualizar}-${id}-${idx}`} className="item-lista">
                      <div className="item-contenido">
                        <span className="modal-texto">{obtenerNombreElemento(el)}</span>
                      </div>

                      <div className="item-acciones">
                        <button 
                          className="modal-boton editar" 
                          onClick={async () => await abrirFormularioEdicion(el)}
                        >
                          Editar
                        </button>
                        <button 
                          className="modal-boton eliminar" 
                          onClick={() => eliminarElemento(el)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            <button className="modal-boton cerrar" onClick={cerrarModal}>
              Cerrar
            </button>
          </div>
        </div>
      )}

      <FormularioEdicion />
    </div>
  );
}

export default Administrador;