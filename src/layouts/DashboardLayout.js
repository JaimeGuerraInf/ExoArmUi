import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import SideMenu from '../components/SideMenu';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/layouts/DashboardLayout.css';

const DashboardLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(true);

  const handleToggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="dashboard-layout">
      <AnimatePresence mode="wait">
        <SideMenu isOpen={isMenuOpen} onToggle={handleToggleMenu} />
      </AnimatePresence>
      
      <motion.main
        className="dashboard-main"
        animate={{
          marginLeft: isMenuOpen ? '280px' : '70px',
          padding: isMenuOpen ? '2rem' : '2rem 2rem 2rem 90px'
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <Outlet />
      </motion.main>
    </div>
  );
};

export default DashboardLayout; 