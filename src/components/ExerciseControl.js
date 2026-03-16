import React, { useState } from "react";
import ExerciseSelector from "./ExerciseSelector";
import ExerciseRunner from "./ExerciseRunner";
import { Card, Button } from "react-bootstrap";

const ExerciseControl = ({ currentAngle }) => {
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [finalScore, setFinalScore] = useState(null);

    const getEncouragementMessage = (score) => {
        if (score >= 90) return "¡Excelente trabajo!  Sigue así.";
        if (score >= 70) return "¡Muy bien! Solo un poco más de precisión.";
        if (score >= 50) return "¡Bien! Pero intenta mejorar la precisión.";
        return "No te desanimes, sigue practicando. ¡Tú puedes! ";
    };

    const handleComplete = (score) => {
        setFinalScore(score);
        setSelectedExercise(null);
    };

    return (
        <div className="container mt-4">
            {!selectedExercise ? (
                finalScore !== null ? (
                    <Card className="p-4 text-center shadow">
                        <h3>¡Ejercicio Completado!</h3>
                        <h4 style={{ color: finalScore > 80 ? "green" : finalScore > 50 ? "orange" : "red" }}>
                            Puntuación Final: {finalScore.toFixed(1)} / 100
                        </h4>
                        <p>{getEncouragementMessage(finalScore)}</p>
                        <Button variant="primary" onClick={() => setFinalScore(null)}>Volver a Ejercicios</Button>
                    </Card>
                ) : (
                    <ExerciseSelector onSelectExercise={setSelectedExercise} />
                )
            ) : (
                <ExerciseRunner exercise={selectedExercise} currentAngle={currentAngle} onComplete={handleComplete} />
            )}
        </div>
    );
};

export default ExerciseControl;

