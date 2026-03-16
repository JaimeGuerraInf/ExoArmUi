import React, { useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import ArmVisualization3D from './ArmVisualization3D';
import useRosAngle from '../hooks/useRosAngle';

const styles = {
  configurationPage: {
    padding: '1.5rem',
    minHeight: 'calc(100vh - 80px)', // Ajustar para el header
    background: '#1a1b26',
    overflowY: 'auto'
  },
  pageTitle: {
    color: '#6EF3C5',
    marginBottom: '1.5rem',
    fontSize: '1.8rem'
  },
  card: {
    background: 'rgba(26, 27, 38, 0.8)',
    border: '1px solid rgba(110, 243, 197, 0.2)',
    borderRadius: '12px',
    marginBottom: '1rem',
    maxHeight: '400px', // Limitar altura máxima
    overflow: 'hidden'
  },
  visualizationContainer: {
    height: '300px',
    position: 'relative',
    borderRadius: '8px',
    overflow: 'hidden'
  },
  muscleInfo: {
    display: 'flex',
    gap: '1.5rem',
    marginTop: '0.5rem',
    padding: '0.75rem',
    background: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '8px'
  },
  muscleIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: 'white',
    fontSize: '0.9rem'
  },
  colorBox: {
    width: '16px',
    height: '16px',
    borderRadius: '4px'
  },
  biceps: {
    background: '#FF6B6B'
  },
  triceps: {
    background: '#4ECDC4'
  },
  statusDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: '#FF6B6B',
    marginRight: '0.5rem'
  },
  statusDotConnected: {
    background: '#6EF3C5'
  },
  angleDisplay: {
    textAlign: 'center',
    padding: '1rem',
    background: 'rgba(110, 243, 197, 0.1)',
    borderRadius: '8px',
    marginTop: '0.75rem'
  },
  angleValue: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#6EF3C5'
  },
  angleRange: {
    color: '#888',
    fontSize: '0.8rem'
  },
  calibrateBtn: {
    width: '100%',
    padding: '0.75rem',
    margin: '0.5rem 0',
    background: 'linear-gradient(45deg, #6EF3C5, #4A90E2)',
    border: 'none',
    borderRadius: '6px',
    color: 'white',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '0.9rem'
  },
  heading: {
    color: '#6EF3C5',
    marginBottom: '1rem',
    fontSize: '1.2rem'
  },
  statusItem: {
    display: 'flex',
    alignItems: 'center',
    color: 'white',
    marginBottom: '0.75rem',
    fontSize: '0.9rem'
  }
};

const Configuracion = () => {
  const { angle, connected } = useRosAngle();

  return (
    <div style={styles.configurationPage}>
      <Container fluid>
        <h2 style={styles.pageTitle}>Configuración y Monitoreo</h2>
        
        <Row>
          <Col lg={8}>
            <Card style={styles.card}>
              <Card.Body>
                <h3 style={styles.heading}>Visualización Anatómica del Exobrazo</h3>
                <div style={styles.visualizationContainer}>
                  <ArmVisualization3D angle={angle} />
                </div>
                <div style={styles.muscleInfo}>
                  <div style={styles.muscleIndicator}>
                    <div style={{...styles.colorBox, ...styles.biceps}}></div>
                    <span>Bíceps Braquial</span>
                  </div>
                  <div style={styles.muscleIndicator}>
                    <div style={{...styles.colorBox, ...styles.triceps}}></div>
                    <span>Tríceps Braquial</span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card style={styles.card}>
              <Card.Body>
                <h3 style={styles.heading}>Estado del Sistema</h3>
                <div style={styles.statusItem}>
                  <span style={{...styles.statusDot, ...(connected ? styles.statusDotConnected : {})}}></span>
                  <span>Conexión ROS: {connected ? 'Conectado' : 'Desconectado'}</span>
                </div>
                <div style={styles.angleDisplay}>
                  <h4>Ángulo Actual</h4>
                  <div style={styles.angleValue}>{angle ? `${Math.round(angle)}°` : 'N/A'}</div>
                  <div style={styles.angleRange}>Rango: 30° - 135°</div>
                </div>
              </Card.Body>
            </Card>

            <Card style={{...styles.card, marginTop: '1rem'}}>
              <Card.Body>
                <h3 style={styles.heading}>Calibración</h3>
                <div>
                  <button style={styles.calibrateBtn}>Calibrar Posición Inicial</button>
                  <button style={styles.calibrateBtn}>Ajustar Límites</button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Configuracion; 