import React from "react";
import { useNavigate } from "react-router-dom";
import HeartGradientLogo from "./HeartGradientLogo";
import { motion } from "framer-motion";
import "../styles/components/WelcomeScreen.css";

const WelcomeScreen = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate("/dashboard");
  };

  return (
    <div className="welcome-container">
      <div className="welcome-content">
        <HeartGradientLogo />
        <motion.h1 
          initial={{ y: -30, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          transition={{ duration: 1 }}
        >
          Exobrazo Rehab
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.5 }}
        >
          Ejercítate con ritmo, progresa con música 
        </motion.p>
        <motion.button
          className="start-btn"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleStart}
        >
          ¡Vamos a comenzar!
        </motion.button>
      </div>
    </div>
  );
};

export default WelcomeScreen;

