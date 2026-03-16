import React from "react";
import AnimatedBackground from "./AnimatedBackground";

const AppLayout = ({ children }) => {
  return (
    <div style={styles.fullscreen}>
      <AnimatedBackground />
      <div style={styles.content}>
        {children}
      </div>
    </div>
  );
};

const styles = {
  fullscreen: {
    position: "fixed",        
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    overflow: "hidden",
    zIndex: 0,
    backgroundColor: "transparent", 
  },
  content: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    height: "100%",
    padding: "40px 20px",
    boxSizing: "border-box",
    color: "white",
    fontFamily: "Inter, sans-serif",
    overflowY: "auto",
  },
};

export default AppLayout;

