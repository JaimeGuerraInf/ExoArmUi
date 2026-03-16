import React, { useEffect, useState, useRef } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label, ReferenceLine,
  ReferenceArea, Brush, AnimationTiming, AreaChart, Area
} from "recharts";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    let precisionClass = "text-danger";
    let precisionText = "Fuera de rango";
    
    if (data.error === 0) {
      precisionClass = "text-warning";
      precisionText = "¡Perfecto!";
    } else if (data.error <= 5) {
      precisionClass = "text-success";
      precisionText = "Correcto";
    }
    
    return (
      <div style={{
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: '10px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '5px',
        color: 'white',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <p style={{ margin: 0 }}>
          <strong>Tiempo:</strong> {data.time}s
        </p>
        <p style={{ margin: 0 }}>
          <strong>Ángulo:</strong> {data.angle.toFixed(1)}°
        </p>
        {data.error !== null && (
          <p style={{ margin: 0 }} className={precisionClass}>
            <strong>Precisión:</strong> {precisionText}
            {data.error > 0 && ` (Error: ${data.error.toFixed(1)}°)`}
          </p>
        )}
      </div>
    );
  }
  return null;
};

const SensorChart = ({ angle, resetGraph, targetAngle }) => {
  const [data, setData] = useState([]);
  const startTimeRef = useRef(Date.now());
  const maxDataPoints = 200;
  const chartRef = useRef(null);
  const animationRef = useRef(null);
  const lastGoldIndexRef = useRef(-1);
  
  const [zoomState, setZoomState] = useState({
    left: 'dataMin',
    right: 'dataMax',
    refAreaLeft: '',
    refAreaRight: '',
    yAxisDomain: [45, 80]
  });

  useEffect(() => {
    if (resetGraph) {
      setData([]);
      startTimeRef.current = Date.now();
      setZoomState({
        left: 'dataMin',
        right: 'dataMax',
        refAreaLeft: '',
        refAreaRight: '',
        yAxisDomain: [45, 80]
      });
      
      const audio = new Audio();
      audio.pause();
    }
  }, [resetGraph]);

  useEffect(() => {
    if (angle !== null) {
      const elapsedSec = ((Date.now() - startTimeRef.current) / 1000).toFixed(2);
      const error = targetAngle !== null && targetAngle !== undefined ? Math.abs(angle - targetAngle) : null;
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      const animate = () => {
        setData(prev => {
          const clampedAngle = Math.max(45, Math.min(80, parseFloat(angle.toFixed(1))));
          const idx = prev.length;
          let status = 'red';

          if (error !== null) {
            if (error <= 5) {
              // Solo marcar un punto dorado por objetivo
              if (idx - lastGoldIndexRef.current > 0) {
                status = 'gold';
                lastGoldIndexRef.current = idx;
              } else {
                // Dentro del mismo objetivo, cuenta como verde (cerca) si cabe
                status = 'green';
              }
            } else if (error <= 15) {
              // Verdes alrededor del dorado, máximo 3 tras él
              if (idx - lastGoldIndexRef.current <= 3 && lastGoldIndexRef.current !== -1) {
                status = 'green';
              }
            }
          }

          const newData = [...prev, {
            time: parseFloat(elapsedSec),
            angle: clampedAngle,
            error: error !== null ? parseFloat(error.toFixed(1)) : null,
            status
          }];

          if (newData.length > maxDataPoints) {
            return newData.slice(-maxDataPoints);
          }
          return newData;
        });
      };
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [angle, targetAngle]);

  const handleZoomIn = (state) => {
    if (state.refAreaLeft === state.refAreaRight || state.refAreaRight === '') {
      setZoomState((prev) => ({
        ...prev,
        refAreaLeft: '',
        refAreaRight: '',
      }));
      return;
    }

    let left = Math.min(state.refAreaLeft, state.refAreaRight);
    let right = Math.max(state.refAreaLeft, state.refAreaRight);

    const visibleData = data.filter(
      d => d.time >= left && d.time <= right
    );

    const angles = visibleData.map(d => d.angle);
    const minAngle = Math.min(...angles);
    const maxAngle = Math.max(...angles);
    
    const range = maxAngle - minAngle;
    const margin = range * 0.15;
    
    const minRange = 30;
    const finalRange = Math.max(range + 2 * margin, minRange);
    
    const bottom = Math.max(45, minAngle - margin);
    const top = Math.min(80, maxAngle + margin);

    setZoomState({
      refAreaLeft: '',
      refAreaRight: '',
      left: left,
      right: right,
      yAxisDomain: [bottom, top]
    });
  };

  const handleZoomOut = () => {
    setZoomState({
      left: 'dataMin',
      right: 'dataMax',
      refAreaLeft: '',
      refAreaRight: '',
      yAxisDomain: [45, 80]
    });
  };

  const handleBrushChange = (newDomain) => {
    if (!newDomain) {
      setZoomState(prev => ({
        ...prev,
        yAxisDomain: [45, 80]
      }));
      return;
    }
    
    const visibleData = data.filter(
      d => d.time >= newDomain[0] && d.time <= newDomain[1]
    );
    
    if (visibleData.length === 0) {
      setZoomState(prev => ({
        ...prev,
        yAxisDomain: [45, 80]
      }));
      return;
    }
    
    const angles = visibleData.map(d => d.angle);
    const minAngle = Math.min(...angles);
    const maxAngle = Math.max(...angles);
    const range = maxAngle - minAngle;
    const margin = range * 0.15;
    
    setZoomState(prev => ({
      ...prev,
      yAxisDomain: [
        Math.max(45, minAngle - margin),
        Math.min(80, maxAngle + margin)
      ]
    }));
  };

  return (
    <div style={{ width: '100%', height: 450, padding: '20px 0' }} ref={chartRef}>
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          onMouseDown={(e) => e && setZoomState(prev => ({ ...prev, refAreaLeft: e.activeLabel }))}
          onMouseMove={(e) => e && zoomState.refAreaLeft && setZoomState(prev => ({ ...prev, refAreaRight: e.activeLabel }))}
          onMouseUp={() => handleZoomIn(zoomState)}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
          <XAxis 
            dataKey="time" 
            stroke="#fff"
            tick={{ fill: '#fff', fontSize: 12 }}
            domain={[zoomState.left, zoomState.right]}
            allowDataOverflow
            height={40}
          >
            <Label 
              value="Tiempo (s)" 
              position="bottom" 
              fill="#fff" 
              offset={20}
              style={{ textAnchor: 'middle', fontSize: 14 }}
            />
          </XAxis>
          <YAxis 
            domain={[45, 80]}
            stroke="#fff"
            tick={{ fill: '#fff', fontSize: 12 }}
            allowDataOverflow={false}
            width={60}
          >
            <Label 
              value="Ángulo (°)" 
              angle={-90} 
              position="insideLeft"
              fill="#fff"
              style={{ textAnchor: 'middle', fontSize: 14 }}
              offset={-10}
            />
          </YAxis>
          <Tooltip content={<CustomTooltip />} />

          {/* Línea objetivo */}
          {targetAngle && (
            <ReferenceLine 
              y={Math.max(45, Math.min(80, targetAngle))}
              stroke="#FFD700"
              strokeWidth={2}
              strokeDasharray="3 3"
              isFront={true}
              label={{
                value: `Objetivo: ${targetAngle}°`,
                fill: '#FFD700',
                position: 'right'
              }}
            />
          )}

          {/* Línea de datos */}
          <Line
            type="monotone"
            dataKey="angle"
            stroke="#00BFFF"
            strokeWidth={2}
            dot={(props) => {
              const { cx, cy, payload } = props;
              if (!payload) return null;
              const { status } = payload;
              if (!status) return null;

              let fillColor = "#FF6B6B";
              let strokeColor = "#DC3545";
              let radius = 4;

              if (status === 'gold') {
                fillColor = '#FFD700';
                strokeColor = '#FFA500';
                radius = 5;
              } else if (status === 'green') {
                fillColor = '#6EF3C5';
                strokeColor = '#4CAF50';
              }

              return <circle cx={cx} cy={cy} r={radius} fill={fillColor} stroke={strokeColor} strokeWidth={status==='gold'?2:1} />;
            }}
            activeDot={{ r: 6 }}
            isAnimationActive={true}
          />

          {/* Área de zoom */}
          {zoomState.refAreaLeft && zoomState.refAreaRight && (
            <ReferenceArea
              x1={zoomState.refAreaLeft}
              x2={zoomState.refAreaRight}
              strokeOpacity={0.3}
              fill="rgba(255,255,255,0.1)"
            />
          )}

          {/* Brush para navegación */}
          <Brush
            dataKey="time"
            height={30}
            stroke="#8884d8"
            fill="rgba(136, 132, 216, 0.1)"
            onChange={handleBrushChange}
            y={360}
            travellerWidth={10}
          animationDuration={300}
          >
            <AreaChart>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <YAxis hide domain={[45, 80]} />
              <Area
                type="monotone"
                dataKey="angle"
                stroke="#8884d8"
                fill="rgba(136, 132, 216, 0.2)"
              />
            </AreaChart>
          </Brush>
        </LineChart>
      </ResponsiveContainer>
      
      {/* Botón de reset zoom */}
      {(zoomState.left !== 'dataMin' || zoomState.right !== 'dataMax') && (
        <button
          style={{
            position: 'absolute',
            right: '10px',
            top: '10px',
            background: 'rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.3)',
            color: 'white',
            padding: '5px 10px',
            borderRadius: '5px',
            cursor: 'pointer',
            zIndex: 1000,
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(5px)'
          }}
          onClick={handleZoomOut}
          onMouseEnter={(e) => e.target.style.background = 'rgba(0,0,0,0.7)'}
          onMouseLeave={(e) => e.target.style.background = 'rgba(0,0,0,0.5)'}
        >
          Reset Zoom
        </button>
      )}
    </div>
  );
};

export default SensorChart;


