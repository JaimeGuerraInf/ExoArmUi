import React, { useState, useEffect } from "react";
import SensorChart from "./SensorChart";
import useRosAngle from "../hooks/useRosAngle";
import ProgressBar from "react-bootstrap/ProgressBar";
import exercises from "../data/exercises";

const ExerciseRunner = ({ selectedSong, onFinish }) => {
  const angle = useRosAngle(!!selectedSong);
  const [currentStep, setCurrentStep] = useState(0);
  const [finished, setFinished] = useState(false);

  const exercise = exercises.find((e) => e.name === selectedSong);
  const sequence = exercise?.sequence || [];

  useEffect(() => {
    if (!selectedSong || angle == null || finished) return;

    const target = sequence[currentStep];

    if (target && Math.abs(angle - target.angle) < 5) {
      // Reproducir sonido si hay
      if (target.sound) {
        const audio = new Audio(target.sound);
        audio.play();
      }

      if (currentStep + 1 < sequence.length) {
        setCurrentStep((step) => step + 1);
      } else {
        setFinished(true);
        onFinish?.();
      }
    }
  }, [angle]);

  const progress = Math.floor((currentStep / sequence.length) * 100);
  const currentNote = sequence[currentStep]?.note ?? "—";
  const nextNote = sequence[currentStep + 1]?.note ?? "—";

  return (
    <div style={{ width: "100%" }}>
      <h4>Ángulo del brazo en tiempo real</h4>

      {/* Enviar un ángulo a la vez */}
      <SensorChart angle={angle} resetGraph={currentStep === 0} />

      <div className="mt-3">
        <p>
          Nota actual: <strong>{currentNote}</strong> | Siguiente:{" "}
          <strong>{nextNote}</strong> | Ángulo:{" "}
          <strong>{angle?.toFixed(1) ?? "—"}</strong>
        </p>
        <ProgressBar now={progress} label={`${progress}%`} animated />
      </div>
    </div>
  );
};

export default ExerciseRunner;


