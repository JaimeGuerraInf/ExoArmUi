import React, { useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import ArmVisualization3D from './ArmVisualization3D';
import useRosAngle from '../hooks/useRosAngle';

const styles = {
  configurationPage: {
    padding: '1.5rem',
    minHeight: 'calc(100vh - 80px)',
    background: '#1a1b26',
    overflowY: 'auto',
    color: 'rgba(255, 255, 255, 0.95)',
    fontFamily: 'Inter, sans-serif'
  },
  pageTitle: {
    color: '#6EF3C5',
    marginBottom: '1.5rem',
    fontSize: '1.8rem',
    fontWeight: '600',
    letterSpacing: '0.5px'
  },
  card: {
    background: 'rgba(26, 27, 38, 0.8)',
    border: '1px solid rgba(110, 243, 197, 0.2)',
    borderRadius: '12px',
    marginBottom: '1rem',
    maxHeight: '400px',
    overflow: 'hidden',
    backdropFilter: 'blur(10px)'
  },
  cardBody: {
    padding: '1.25rem'
  },
  visualizationContainer: {
    height: '300px',
    position: 'relative',
    borderRadius: '8px',
    overflow: 'hidden',
    background: 'rgba(0, 0, 0, 0.2)'
  },
  muscleInfo: {
    display: 'flex',
    gap: '1.5rem',
    marginTop: '0.5rem',
    padding: '0.75rem',
    background: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '8px',
    justifyContent: 'center'
  },
  muscleIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: 'rgba(255, 255, 255, 0.95)',
    fontSize: '0.9rem',
    fontWeight: '500'
  },
  colorBox: {
    width: '16px',
    height: '16px',
    borderRadius: '4px',
    border: '2px solid rgba(255, 255, 255, 0.1)'
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
    marginRight: '0.5rem',
    boxShadow: '0 0 10px rgba(255, 107, 107, 0.3)'
  },
  statusDotConnected: {
    background: '#6EF3C5',
    boxShadow: '0 0 10px rgba(110, 243, 197, 0.3)'
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
    fontWeight: '700',
    color: '#6EF3C5',
    textShadow: '0 0 20px rgba(110, 243, 197, 0.3)'
  },
  angleRange: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '0.8rem',
    fontWeight: '500'
  },
  calibrateBtn: {
    width: '100%',
    padding: '0.75rem',
    margin: '0.5rem 0',
    background: 'linear-gradient(45deg, #6EF3C5, #4A90E2)',
    border: 'none',
    borderRadius: '6px',
    color: 'white',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '0.9rem',
    letterSpacing: '0.5px',
    textTransform: 'uppercase'
  },
  heading: {
    color: '#6EF3C5',
    marginBottom: '1rem',
    fontSize: '1.2rem',
    fontWeight: '600',
    letterSpacing: '0.5px'
  },
  statusItem: {
    display: 'flex',
    alignItems: 'center',
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: '0.75rem',
    fontSize: '0.9rem',
    fontWeight: '500'
  },
  subHeading: {
    color: 'rgba(255, 255, 255, 0.95)',
    fontSize: '1rem',
    fontWeight: '600',
    marginBottom: '0.5rem'
  }
};

const Configuracion = () => {
  const { 
    angle, 
    connected, 
    calibrated,
    calibrateSystem,
    adjustLimits 
  } = useRosAngle();

  const [calibrating, setCalibrating] = useState(false);
  const [adjustingLimits, setAdjustingLimits] = useState(false);

  const handleCalibrate = async () => {
    setCalibrating(true);
    const success = await calibrateSystem();
    if (!success) {
      console.error('Error al calibrar el sistema');
    }
    setTimeout(() => setCalibrating(false), 2000);
  };

  const handleAdjustLimits = async () => {
    setAdjustingLimits(true);
    const success = await adjustLimits();
    if (!success) {
      console.error('Error al ajustar límites');
    }
    setTimeout(() => setAdjustingLimits(false), 2000);
  };

  return (
    <div style={styles.configurationPage}>
      <Container fluid>
        <h2 style={styles.pageTitle}>Configuración y Monitoreo</h2>
        
        <Row>
          <Col lg={8}>
            <Card style={styles.card}>
              <Card.Body style={styles.cardBody}>
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
              <Card.Body style={styles.cardBody}>
                <h3 style={styles.heading}>Estado del Sistema</h3>
                <div style={styles.statusItem}>
                  <span style={{...styles.statusDot, ...(connected ? styles.statusDotConnected : {})}}></span>
                  <span>Conexión ROS: {connected ? 'Conectado' : 'Desconectado'}</span>
                </div>
                <div style={styles.statusItem}>
                  <span style={{...styles.statusDot, ...(calibrated ? styles.statusDotConnected : {})}}></span>
                  <span>Calibración: {calibrated ? 'Calibrado' : 'No Calibrado'}</span>
                </div>
                <div style={styles.angleDisplay}>
                  <h4 style={styles.subHeading}>Ángulo Actual</h4>
                  <div style={styles.angleValue}>{angle ? `${Math.round(angle)}°` : 'N/A'}</div>
                  <div style={styles.angleRange}>Rango: 30° - 135°</div>
                </div>
              </Card.Body>
            </Card>

            <Card style={{...styles.card, marginTop: '1rem'}}>
              <Card.Body style={styles.cardBody}>
                <h3 style={styles.heading}>Calibración</h3>
                <div>
                  <button 
                    style={{
                      ...styles.calibrateBtn,
                      opacity: calibrating ? 0.7 : 1,
                      cursor: calibrating ? 'not-allowed' : 'pointer'
                    }}
                    onClick={handleCalibrate}
                    disabled={calibrating || !connected}
                  >
                    {calibrating ? 'Calibrando...' : 'Calibrar Posición Inicial'}
                  </button>
                  <button 
                    style={{
                      ...styles.calibrateBtn,
                      opacity: adjustingLimits ? 0.7 : 1,
                      cursor: adjustingLimits ? 'not-allowed' : 'pointer'
                    }}
                    onClick={handleAdjustLimits}
                    disabled={adjustingLimits || !connected}
                  >
                    {adjustingLimits ? 'Ajustando...' : 'Ajustar Límites'}
                  </button>
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