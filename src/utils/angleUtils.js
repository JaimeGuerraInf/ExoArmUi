// Ángulos reales del brazo (entrada)
const MIN_INPUT_ANGLE = 45; // Flexión total (45° real)
const MAX_INPUT_ANGLE = 80; // Extensión total (180° real)

// Ángulos deseados para visualización y ejercicios
const MIN_OUTPUT_ANGLE = 45;  // Flexión total
const MAX_OUTPUT_ANGLE = 180; // Extensión total

/**
 * Convierte un ángulo del brazo real (45-80°) a un ángulo visual (45-180°)
 */
export const convertInputToVisualAngle = (inputAngle) => {
  if (inputAngle === null || inputAngle === undefined) return null;
  
  // Limitar el ángulo de entrada al rango válido
  const clampedInputAngle = Math.max(MIN_INPUT_ANGLE, Math.min(MAX_INPUT_ANGLE, inputAngle));
  
  // Convertir el ángulo de entrada al rango de salida
  const normalizedAngle = (clampedInputAngle - MIN_INPUT_ANGLE) / (MAX_INPUT_ANGLE - MIN_INPUT_ANGLE);
  return MIN_OUTPUT_ANGLE + normalizedAngle * (MAX_OUTPUT_ANGLE - MIN_OUTPUT_ANGLE);
};

/**
 * Convierte un ángulo visual (45-180°) a un ángulo del brazo real (45-80°)
 */
export const convertVisualToInputAngle = (visualAngle) => {
  if (visualAngle === null || visualAngle === undefined) return null;
  
  // Limitar el ángulo visual al rango válido
  const clampedVisualAngle = Math.max(MIN_OUTPUT_ANGLE, Math.min(MAX_OUTPUT_ANGLE, visualAngle));
  
  // Convertir el ángulo visual al rango de entrada
  const normalizedAngle = (clampedVisualAngle - MIN_OUTPUT_ANGLE) / (MAX_OUTPUT_ANGLE - MIN_OUTPUT_ANGLE);
  return MIN_INPUT_ANGLE + normalizedAngle * (MAX_INPUT_ANGLE - MIN_INPUT_ANGLE);
};

export const ANGLE_RANGES = {
  MIN_INPUT_ANGLE,
  MAX_INPUT_ANGLE,
  MIN_OUTPUT_ANGLE,
  MAX_OUTPUT_ANGLE
}; 