import React from 'react'
import '../assets/css/inicio.css'
import { Link } from 'react-router-dom' 

import instagram from '../assets/img/2111463.png'
import facebook from '../assets/img/5968764.png'
import bienestar from '../assets/img/bann-que-son-descrip-3_.jpg'
import educacion from '../assets/img/bann-que-son-descrip_.jpg'
import emprendimiento from '../assets/img/claudia.png'
import logo from '../assets/img/download-removebg-preview.png'

function Inicio() {
  // Función para hacer scroll suave a una sección
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
  <div className='Iniciobody'>
    {/* Header */}
    <header className="site-header">
      <nav className="navbar" aria-label="Navegación principal">
        <div className="logo">
          <img src={logo} alt="Logo Manzanas del Cuidado" className="logo-img" />
          <h1 className="logo-title">Manzanas del Cuidado</h1>
        </div>
        
        <div className="nav-links-container">
          <ul className="nav-links" role="menubar">
            <li className="nav-item" role="none">
              <button 
                onClick={() => scrollToSection('hero')} 
                className="nav-link" 
                role="menuitem"
              >
                Inicio
              </button>
            </li>
            <li className="nav-item" role="none">
              <button 
                onClick={() => scrollToSection('servicios')} 
                className="nav-link" 
                role="menuitem"
              >
                Servicios
              </button>
            </li>
            <li className="nav-item" role="none">
              <button 
                onClick={() => scrollToSection('manzanas')} 
                className="nav-link" 
                role="menuitem"
              >
                Manzanas
              </button>
            </li>
            <li className="nav-item" role="none">
              <button 
                onClick={() => scrollToSection('nosotros')} 
                className="nav-link" 
                role="menuitem"
              >
                Sobre Nosotros
              </button>
            </li>
            <li className="nav-item" role="none">
              <button 
                onClick={() => scrollToSection('contacto')} 
                className="nav-link" 
                role="menuitem"
              >
                Contacto
              </button>
            </li>
          </ul>
        </div>

        <div className="auth-buttons-container">
          <ul className="auth-buttons nav-menu" role="menu">
            <li className="auth-item" role="none">
              <Link to="/ingresar" className="login-btn auth-link" role="menuitem">Iniciar Sesión</Link>
            </li>
            <li className="auth-item" role="none">
              <Link to="/registrarse" className="register-btn auth-link" role="menuitem">Registrarse</Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>

    {/* Hero Section */}
    <section id="hero" className="hero" aria-labelledby="hero-heading">
      <div className="hero-content">
        <h2 id="hero-heading" className="hero-title">Bienestar y apoyo para mujeres cuidadoras</h2>
        <p className="hero-description">
          Las Manzanas del Cuidado son espacios de la ciudad en los que se brinda tiempo y servicios gratuitos a las mujeres cuidadoras y a sus familias.
        </p>
        <div className="hero-buttons">
          <button onClick={() => scrollToSection('servicios')} className="btn btn-primary hero-button">Conocer más</button>
          <button onClick={() => scrollToSection('manzanas')} className="btn btn-outline hero-button">Ubicar manzanas</button>
        </div>
      </div>
    </section>

    {/* Features Section */}
    <section id="servicios" className="features" aria-labelledby="services-heading">
      <div className="section-header">
        <h2 id="services-heading" className="section-title">Nuestros Servicios</h2>
        <p className="section-subtitle">Descubre todos los servicios gratuitos que tenemos para ti y tu familia</p>
      </div>

      <div className="services-grid">
        <article className="service-card">
          <img src={educacion} alt="Educación" className="service-image" />
          <div className="service-content">
            <h3 className="service-title">Educación</h3>
            <p className="service-description">
              Cursos gratuitos para completar tu educación básica, media o técnica profesional.
            </p>
          </div>
        </article>

        <article className="service-card">
          <img src={emprendimiento} alt="Emprendimiento" className="service-image" />
          <div className="service-content">
            <h3 className="service-title">Emprendimiento</h3>
            <p className="service-description">
              Asesoría para iniciar o fortalecer tu negocio, acceso a créditos y capacitación.
            </p>
          </div>
        </article>

        <article className="service-card">
          <img src={bienestar} alt="Bienestar" className="service-image" />
          <div className="service-content">
            <h3 className="service-title">Bienestar</h3>
            <p className="service-description">
              Actividades recreativas, deportivas y culturales para tu descanso y recreación.
            </p>
          </div>
        </article>
      </div>
    </section>

    {/* Map Section */}
    <section id="manzanas" className="map-section" aria-labelledby="map-heading">
      <div className="map-container">
        <div className="section-header">
          <h2 id="map-heading" className="section-title">Encuentra tu Manzana más cercana</h2>
          <p className="section-subtitle">Ubica la manzana del cuidado más cercana a tu domicilio</p>
        </div>

        <div className="manzana-map">
          <div className="map-iframe-container">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7953.886069030175!2d-74.06825842137448!3d4.604223202993216!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e3f9996ab64be87%3A0x866665ef9787eebb!2sManzana%20del%20Cuidado%20del%20Centro%20de%20Bogot%C3%A1!5e0!3m2!1ses!2sco!4v1747778387312!5m2!1ses!2sco"
              width="100%"
              height="100%"
              className="map-iframe"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Mapa Manzana del Cuidado"
              aria-label="Mapa interactivo de Manzanas del Cuidado"
            ></iframe>
          </div>
          <div className="map-overlay">
            <h3 className="map-location-title">Manzana Central</h3>
            <address className="map-location-info">
              <p><strong>Localidad:</strong> Santa Fe</p>
              <p><strong>Dirección:</strong> Cra. 6 #14-98 Piso 4, Santa Fé, Bogotá, Cundinamarca</p>
              <p><strong>Servicios:</strong> Manzana del cuidado ubicada en la Oficina del Gobierno del Distrito</p>
            </address>
            <Link to="#" className="btn btn-primary map-link">Ver detalles</Link>
          </div>
        </div>
      </div>
    </section>

    {/* Sobre Nosotros Section */}
    <section id="nosotros" className="about-section" aria-labelledby="about-heading">
      <div className="section-header">
        <h2 id="about-heading" className="section-title">Sobre Nosotros</h2>
        <p className="section-subtitle">Conoce más sobre las Manzanas del Cuidado</p>
      </div>
      <div className="about-content">
        <div className="about-text">
          <h3>Nuestra Misión</h3>
          <p>
            Las Manzanas del Cuidado son espacios donde las mujeres que dedican su tiempo al cuidado de otros pueden acceder a servicios gratuitos y tiempo para ellas mismas.
          </p>
          <h3>Nuestra Visión</h3>
          <p>
            Crear una red de apoyo integral que reconozca y valore el trabajo de cuidado, proporcionando espacios de desarrollo personal y profesional para las mujeres cuidadoras.
          </p>
        </div>
        <div className="about-stats">
          <div className="stat-item">
            <h4>20+</h4>
            <p>Manzanas en Bogotá</p>
          </div>
          <div className="stat-item">
            <h4>50,000+</h4>
            <p>Mujeres beneficiadas</p>
          </div>
          <div className="stat-item">
            <h4>100+</h4>
            <p>Servicios disponibles</p>
          </div>
        </div>
      </div>
    </section>

    {/* Contacto Section */}
    <section id="contacto" className="contact-section" aria-labelledby="contact-heading">
      <div className="section-header">
        <h2 id="contact-heading" className="section-title">Contacto</h2>
        <p className="section-subtitle">Ponte en contacto con nosotros</p>
      </div>
      <div className="contact-content">
        <div className="contact-info">
          <h3>Información de Contacto</h3>
          <div className="contact-item">
            <strong>Dirección:</strong>
            <p>Alcaldía Mayor de Bogotá, Distrito Capital</p>
          </div>
          <div className="contact-item">
            <strong>Teléfono:</strong>
            <p>+57 1 381 3000</p>
          </div>
          <div className="contact-item">
            <strong>Email:</strong>
            <p>manzanasdelcuidado@bogota.gov.co</p>
          </div>
          <div className="contact-item">
            <strong>Horarios:</strong>
            <p>Lunes a Viernes: 8:00 AM - 5:00 PM</p>
          </div>
        </div>
        <div className="social-media">
          <h3>Síguenos en Redes Sociales</h3>
          <div className="social-links">
            <a href="https://www.facebook.com/groups/350023832768158" className="social-icon" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <img src={facebook} alt="" className="social-icon-img" />
            </a>
            <a href="https://www.instagram.com/" className="social-icon" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <img src={instagram} alt="" className="social-icon-img" />
            </a>
          </div>
        </div>
      </div>
    </section>

    {/* Footer */}
    <footer className="site-footer" aria-label="Pie de página">
      <div className="footer-wave">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path fill="var(--morado-oscuro)" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,165.3C1248,149,1344,107,1392,85.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
      
      <div className="footer-content">
        <div className="footer-main">
          <div className="footer-section">
            <div className="footer-logo">
              <img src={logo} alt="Logo Manzanas del Cuidado" className="footer-logo-img" />
              <h3 className="footer-logo-title">Manzanas del Cuidado</h3>
            </div>
            <p className="footer-description">
              Espacios de bienestar y desarrollo para mujeres cuidadoras en Bogotá. 
              Brindamos servicios gratuitos y tiempo de calidad para el autocuidado.
            </p>
            <div className="footer-social">
              <h4>Síguenos</h4>
              <div className="social-links">
                <a href="https://www.facebook.com/groups/350023832768158" className="social-icon" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <img src={facebook} alt="" className="social-icon-img" />
                </a>
                <a href="https://www.instagram.com/" className="social-icon" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <img src={instagram} alt="" className="social-icon-img" />
                </a>
              </div>
            </div>
          </div>

          <div className="footer-section">
            <h4 className="footer-section-title">Servicios</h4>
            <ul className="footer-links">
              <li><button onClick={() => scrollToSection('servicios')} className="footer-link">Educación</button></li>
              <li><button onClick={() => scrollToSection('servicios')} className="footer-link">Emprendimiento</button></li>
              <li><button onClick={() => scrollToSection('servicios')} className="footer-link">Bienestar</button></li>
              <li><button onClick={() => scrollToSection('servicios')} className="footer-link">Recreación</button></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-section-title">Información</h4>
            <ul className="footer-links">
              <li><button onClick={() => scrollToSection('nosotros')} className="footer-link">Sobre Nosotros</button></li>
              <li><button onClick={() => scrollToSection('manzanas')} className="footer-link">Ubicar Manzanas</button></li>
              <li><button onClick={() => scrollToSection('contacto')} className="footer-link">Contacto</button></li>
              <li><Link to="/ingresar" className="footer-link">Iniciar Sesión</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-section-title">Contacto</h4>
            <div className="footer-contact">
              <div className="contact-item">
                <span className="contact-icon">📍</span>
                <span>Alcaldía Mayor de Bogotá</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">📞</span>
                <span>+57 1 381 3000</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">✉️</span>
                <span>manzanasdelcuidado@bogota.gov.co</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">🕒</span>
                <span>Lun - Vie: 8:00 AM - 5:00 PM</span>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="copyright">
              &copy; 2025 <strong>Las Manzanas del Cuidado</strong>. Todos los derechos reservados.
            </p>
            <div className="footer-bottom-links">
              <Link to="/" className="footer-bottom-link">Política de Privacidad</Link>
              <span className="separator">•</span>
              <Link to="/" className="footer-bottom-link">Términos de Uso</Link>
              <span className="separator">•</span>
              <Link to="/" className="footer-bottom-link">Mapa del Sitio</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  </div>
);
}

export default Inicio

