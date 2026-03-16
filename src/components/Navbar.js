import React from "react";
import { Navbar, Container, Nav } from "react-bootstrap";
import { FaHeartbeat, FaHome, FaMusic } from "react-icons/fa";

const CustomNavbar = () => {
    return (
        <Navbar expand="lg" className="navbar-custom">
            <Container>
                <Navbar.Brand href="/">
                    <FaHeartbeat style={{ marginRight: 10 }} /> ExoBrazo Rehab
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto">
                        <Nav.Link href="/"><FaHome /> Inicio</Nav.Link>
                        <Nav.Link href="/ejercicios"><FaMusic /> Ejercicios</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default CustomNavbar;

