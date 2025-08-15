import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import '../assets/css/ingresar.css'

function IniciarSesion() {
  const [tipoDocumento, setTipo] = useState('');
  const [documento, setDocumento] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Para redirigir

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!tipoDocumento || !documento) {
      alert('Todos los campos son obligatorios');
      return;
    }

    setLoading(true);

    const login = {
      TipoDocumento: tipoDocumento,
      Documento: documento,
    };

    try {
      const res = await fetch('http://localhost:5000/api/iniciar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(login)
      });

      const result = await res.json();
      console.log(result)
      
      if (result.success) {
          alert(result.message);
          
          if (result.data && result.data.Rol === 'administrador') {
                navigate('/administrador');
              } else {
                navigate('/usuario');
              }
        } 
        else {
        alert(result.message || 'Credenciales incorrectas');
      }

    } catch (error) {
      console.error(error);
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className='Ingresarbody'>
    <main className="login-container">
      <header className="login-header">
        <h2 className="login-title">Iniciar Sesión</h2>
      </header>

      <form className="login-form" onSubmit={handleSubmit}>
        <fieldset className="form-fieldset">
          <legend className="sr-only">Datos de acceso</legend>
          
          <div className="input-group">
            <label htmlFor="TipoDocumento" className="input-label">
              Tipo de Documento
            </label>
            <select
              id="TipoDocumento"
              name="TipoDocumento"
              className="input-select"
              value={tipoDocumento}
              onChange={(e) => setTipo(e.target.value)}
              required
              aria-required="true"
            >
              <option value="">Seleccione</option>
              <option value="TI">TI</option>
              <option value="CC">CC</option>
            </select>
          </div>

          <div className="input-group">
            <label htmlFor="Documento" className="input-label">
              Número de Documento
            </label>
            <input
              type="text"
              id="Documento"
              name="Documento"
              className="input-text"
              value={documento}
              onChange={(e) => setDocumento(e.target.value)}
              required
              aria-required="true"
            />
          </div>
        </fieldset>

        <div className="form-actions">
          <button 
            type="submit" 
            id="btnInicio" 
            className="submit-button"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? (
              <span className="button-loading">
                <span className="spinner" aria-hidden="true"></span>
                Verificando...
              </span>
            ) : (
              'INICIAR SESIÓN'
            )}
          </button>

          <button 
            type="button" 
            className="boton back-button"
            onClick={() => navigate('/')}
          >
            Atrás
          </button>
        </div>
      </form>
    </main>
  </div>
  )
}

export default IniciarSesion;

