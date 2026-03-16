import React, { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";

const HeartGradientLogo = () => {
  const controls = useAnimation();

  useEffect(() => {
    controls.start({
      scale: [1, 1.05, 1],
      transition: {
        repeat: Infinity,
        duration: 2,
        ease: "easeInOut",
      },
    });
  }, [controls]);

  return (
    <motion.svg
      animate={controls}
      initial={{ scale: 1 }}
      width="150"
      height="150"
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="pulseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%">
            <animate attributeName="stop-color" values="#6EF3C5;#6C5CE7;#6EF3C5" dur="5s" repeatCount="indefinite" />
          </stop>
          <stop offset="100%">
            <animate attributeName="stop-color" values="#6C5CE7;#6EF3C5;#6C5CE7" dur="5s" repeatCount="indefinite" />
          </stop>
        </linearGradient>
      </defs>

      {/* Contorno corazón */}
      <path
        d="M32 58s-20-16.25-20-30c0-6.63 5.37-12 12-12 4.17 0 8 2.52 8 7.5C32 18.52 35.83 16 40 16c6.63 0 12 5.37 12 12 0 13.75-20 30-20 30z"
        fill="none"
        stroke="url(#pulseGradient)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Línea de pulso - ajustada para llegar al contorno y equilibrar proporciones */}
      <path
        d="M14 33h11l3-6 6 12 4-6 3 4h8"
        fill="none"
        stroke="url(#pulseGradient)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </motion.svg>
  );
};

export default HeartGradientLogo;

