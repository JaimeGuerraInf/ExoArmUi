import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import HeartGradientLogo from './HeartGradientLogo';
import { FaBars, FaHome, FaMusic, FaChartLine, FaCog, FaSignOutAlt, FaTimes } from 'react-icons/fa';
import '../styles/components/SideMenu.css';

const SideMenu = ({ isOpen, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      title: 'Inicio',
      icon: <FaHome />,
      path: '/dashboard'
    },
    {
      title: 'Ejercicios Analíticos',
      icon: <FaMusic />,
      path: '/ejercicios'
    },
    {
      title: 'Ejercicios de Seguimiento',
      icon: <FaChartLine />,
      path: '/progreso'
    },
    {
      title: 'Configuración',
      icon: <FaCog />,
      path: '/configuracion'
    }
  ];

  return (
    <div className={`side-menu ${!isOpen ? 'collapsed' : ''}`}>
      <div className="menu-header">
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              className="logo-container"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              key="full-logo"
            >
              <motion.div
                className="heart-logo"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              >
                <HeartGradientLogo size={30} />
              </motion.div>
              <div className="logo-text">
                <h3>Exobrazo Rehab</h3>
              </div>
            </motion.div>
          ) : (
            <motion.div
              className="logo-container-small"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              key="small-logo"
            >
              <FaBars className="menu-icon" />
            </motion.div>
          )}
        </AnimatePresence>
        <button className="toggle-button" onClick={onToggle}>
          <FaBars />
        </button>
      </div>
      
      <nav className="menu-items">
        {menuItems.map((item, index) => (
          <motion.button
            key={index}
            className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
            whileHover={{ x: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="item-icon">{item.icon}</span>
            <AnimatePresence>
              {isOpen && (
                <motion.span
                  className="item-title"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {item.title}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </nav>

      <div className="menu-footer">
        <motion.button 
          className="logout-button"
          onClick={() => navigate('/')}
          whileHover={{ x: 5 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="item-icon"><FaSignOutAlt /></span>
          <AnimatePresence>
            {isOpen && (
              <motion.span
                className="item-title"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                Salir
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  );
};

export default SideMenu; 