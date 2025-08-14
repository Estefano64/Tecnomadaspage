import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// Componentes
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

// Páginas
import Home from './pages/Home/Home';
import PropiedadDetalle from './pages/PropiedadDetalle/PropiedadDetalle';
import Catalogo from './pages/Catalogo/Catalogo';
import Contacto from './pages/Contacto/Contacto';
import Login from './pages/Login/Login';
import Admin from './pages/Admin/Admin';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Ruta pública de login */}
          <Route path="/login" element={<Login />} />
          
          {/* Ruta protegida de admin */}
          <Route path="/admin" element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          } />
          
          {/* Rutas públicas con layout normal */}
          <Route path="/*" element={
            <>
              <Header />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/catalogo" element={<Catalogo />} />
                  <Route path="/propiedad/:id" element={<PropiedadDetalle />} />
                  <Route path="/contacto" element={<Contacto />} />
                </Routes>
              </main>
              <Footer />
            </>
          } />
        </Routes>
        
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </Router>
  );
}

export default App;