import React from "react";
import { motion } from "framer-motion";

const cardVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  whileHover: { scale: 1.05, transition: { type: "spring", stiffness: 300 } },
};

const OptionCard = ({ icon, title, description, onClick }) => {
  return (
    <motion.div
      className="option-card"
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="whileHover"
      onClick={onClick}
    >
      <i className={icon}></i>
      <h4>{title}</h4>
      <p>{description}</p>
    </motion.div>
  );
};

export default OptionCard;
