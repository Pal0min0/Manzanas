import React from 'react';
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Inicio from './pages/inicio';
import Iniciarsesion from './pages/iniciarsesion';
import Registrarse from './pages/registrarse';
import Usuario from './pages/usuario';
import Administrador from './pages/administrador';



function App() {

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
            <Route path='/'element={<Inicio/>} />
            <Route path="/ingresar" element={<Iniciarsesion/>} />
            <Route path="/registrarse" element={<Registrarse/>} />
            <Route path="/usuario" element={<Usuario/>} />
            <Route path="/administrador" element={<Administrador/>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;