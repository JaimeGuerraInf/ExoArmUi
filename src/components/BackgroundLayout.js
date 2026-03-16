import React, { memo } from 'react';
import AnimatedBackground from './AnimatedBackground';
import '../styles/components/Background.css';

const BackgroundLayout = ({ children }) => {
  return (
    <div className="root-wrapper">
      <div className="background-wrapper">
        <AnimatedBackground />
      </div>
      <div className="gradient-overlay" />
      <main className="content-wrapper">
        {children}
      </main>
    </div>
  );
};

// Memorizamos el componente para evitar re-renders innecesarios
export default memo(BackgroundLayout); 