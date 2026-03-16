import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import WelcomeScreen from "./components/WelcomeScreen";
import DashboardHome from "./components/DashboardHome";
import EjerciciosMusicales from "./components/EjerciciosMusicales";
import Progress from "./components/Progress";
import Configuracion from "./components/Configuracion";
import DashboardLayout from "./layouts/DashboardLayout";
import BackgroundLayout from "./components/BackgroundLayout";
import "./styles/global/App.css";

function App() {
  return (
    <Router>
      <BackgroundLayout>
        <Routes>
          <Route path="/" element={<WelcomeScreen />} />
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardHome />} />
            <Route path="/ejercicios" element={<EjerciciosMusicales />} />
            <Route path="/progreso" element={<Progress />} />
            <Route path="/configuracion" element={<Configuracion />} />
          </Route>
        </Routes>
      </BackgroundLayout>
    </Router>
  );
}

export default App;



