import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaMusic, FaChartLine, FaCog } from "react-icons/fa";
import HeartGradientLogo from "./HeartGradientLogo";
import "../styles/components/DashboardHome.css";

const DashboardHome = () => {
  const navigate = useNavigate();

  const cards = [
    {
      icon: <FaMusic className="card-icon" />,
      title: "Ejercicios Analíticos",
      description: "Realiza ejercicios precisos siguiendo patrones musicales para mejorar tu control motor.",
      path: "/ejercicios",
      color: "var(--primary-gradient)"
    },
    {
      icon: <FaChartLine className="card-icon" />,
      title: "Ejercicios de Seguimiento",
      description: "Practica movimientos continuos siguiendo trayectorias visuales en tiempo real.",
      path: "/progreso",
      color: "var(--secondary-gradient)"
    },
    {
      icon: <FaCog className="card-icon" />,
      title: "Configuración",
      description: "Personaliza tu experiencia y ajusta las preferencias del sistema.",
      path: "/configuracion",
      color: "var(--tertiary-gradient)"
    }
  ];

  return (
    <motion.div
      className="dashboard-content page-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      <div className="dashboard-header">
        <HeartGradientLogo />
        <h1 className="dashboard-title">Bienvenido a tu Terapia</h1>
          </div>

      <div className="dashboard-cards">
        {cards.map((card, index) => (
          <motion.div 
            key={card.path}
            className="dashboard-card"
            onClick={() => navigate(card.path)}
            whileHover={{ 
              scale: 1.05,
              background: card.color
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 300,
              delay: index * 0.1 
            }}
          >
            {card.icon}
            <h3>{card.title}</h3>
            <p>{card.description}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default DashboardHome;


