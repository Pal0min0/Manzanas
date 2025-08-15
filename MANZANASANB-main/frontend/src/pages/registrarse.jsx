import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import '../assets/css/registrarse.css';

function Registrarse() {
  const [formData, setFormData] = useState({
    NombreUsuario: '',
    TipoDocumento: '',
    Documento: '',
    Rol: '',
    Man: ''
  });
  const [loading, setLoading] = useState(false);
  const [manzanas, setManzanas] = useState([]);
  const [cargandoManzanas, setCargandoManzanas] = useState(true);
  const navigate = useNavigate();

  // Cargar manzanas al montar el componente
  useEffect(() => {
    cargarManzanas();
  }, []);

  const cargarManzanas = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/manzanas');
      const result = await response.json();
      
      if (result.success) {
        setManzanas(result.data);
      } else {
        console.error('Error al cargar manzanas:', result.message);
      }
    } catch (error) {
      console.error('Error de conexión:', error);
    } finally {
      setCargandoManzanas(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { NombreUsuario, TipoDocumento, Documento, Rol, Man } = formData;

    if (!NombreUsuario || !TipoDocumento || !Documento || !Rol || !Man) {
      alert('Por favor complete todos los campos');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/crear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      let result;
      try {
        result = await res.json();
      } catch (parseError) {
        console.error('Error al parsear respuesta:', parseError);
        alert('Error interno del servidor. Respuesta no válida.');
        return;
      }

      if (result.success) {
        alert(result.message);
        // Redirigir basado en el rol
        if (result.data && result.data.Rol === 'administrador') {
          navigate('/administrador');
        } else {
          navigate('/usuario');
        } 
      } else {
        alert(result.message || 'Error al registrar usuario');
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      alert('Error de conexión con el servidor. Verifique que el servidor esté ejecutándose.');
    } finally {
      setLoading(false);
    }
  };

return (
  <div className='Registrarsebody'>
    <form className="formulario" onSubmit={handleSubmit} aria-label="Formulario de registro">
      <header className="form-header">
        <h1 className="form-title">Registre sus datos</h1>
      </header>

      <div className="form-fields">
        {/* Grupo de campo Nombre */}
        <div className="form-group">
          <label htmlFor="NombreUsuario" className="form-label">Nombre</label>
          <input
            type="text"
            id="NombreUsuario"
            name="NombreUsuario"
            className="form-input"
            value={formData.NombreUsuario}
            onChange={handleChange}
            required
            aria-required="true"
          />
        </div>

        {/* Grupo de campo Tipo de documento */}
        <div className="form-group">
          <label htmlFor="TipoDocumento" className="form-label">Tipo de documento</label>
          <select
            name="TipoDocumento"
            id="TipoDocumento"
            className="form-select"
            value={formData.TipoDocumento}
            onChange={handleChange}
            required
            aria-required="true"
          >
            <option value="">Seleccione...</option>
            <option value="CC">Cédula de Ciudadanía</option>
            <option value="TI">Tarjeta de Identidad</option>
            <option value="CE">Cédula de Extranjería</option>
          </select>
        </div>

        {/* Grupo de campo Tipo de usuario */}
        <div className="form-group">
          <label htmlFor="Rol" className="form-label">Tipo de usuario</label>
          <select
            name="Rol"
            id="Rol"
            className="form-select"
            value={formData.Rol}
            onChange={handleChange}
            required
            aria-required="true"
          >
            <option value="">Seleccione...</option>
            <option value="usuario">Usuario</option>
            <option value="administrador">Administrador</option>
          </select>
        </div>

        {/* Grupo de campo Documento */}
        <div className="form-group">
          <label htmlFor="Documento" className="form-label">Documento</label>
          <input
            type="text"
            id="Documento"
            name="Documento"
            className="form-input"
            value={formData.Documento}
            onChange={handleChange}
            required
            aria-required="true"
          />
        </div>

        {/* Grupo de campo Manzana */}
        <div className="form-group">
          <label htmlFor="Man" className="form-label">Manzana</label>
          <select
            name="Man"
            id="Man"
            className="form-select"
            value={formData.Man}
            onChange={handleChange}
            required
            aria-required="true"
            disabled={cargandoManzanas}
          >
            <option value="">
              {cargandoManzanas ? 'Cargando manzanas...' : 'Seleccione...'}
            </option>
            {manzanas.map((manzana) => (
              <option key={manzana.Id_M} value={manzana.Id_M}>
                {manzana.NombreManzana}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-actions">
        <button 
          className="boton submit-button" 
          type="submit" 
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? (
            <>
              <span className="spinner" aria-hidden="true"></span>
              Procesando...
            </>
          ) : 'Enviar'}
        </button>

        <button 
          className="boton back-button" 
          type="button" 
          onClick={() => navigate('/')}
        >
          Atrás
        </button>
      </div>
    </form>
  </div>
);
}

export default Registrarse;

