import React, { useState } from "react";
import { Button } from "react-bootstrap";

const ThemeToggle = () => {
    const [darkMode, setDarkMode] = useState(false);

    const toggleTheme = () => {
        setDarkMode(!darkMode);
        document.body.classList.toggle("dark-mode");
    };

    return (
        <Button className="mt-3" variant="secondary" onClick={toggleTheme}>
            {darkMode ? "Modo Claro" : "Modo Oscuro"}
        </Button>
    );
};

export default ThemeToggle;
