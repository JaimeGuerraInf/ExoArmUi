#include <ArduinoJson.h>

// Pin del potenciómetro o sensor de ángulo
const int ANGLE_PIN = A0;  // Ajusta esto según tu configuración

// Variables para el filtrado
float filteredAngle = 0;
const float ALPHA = 0.1;  // Factor de suavizado (0-1)

// Variables de estado
bool isCalibrated = false;
bool isExerciseActive = false;
float minAngle = 30.0;
float maxAngle = 135.0;

void setup() {
  Serial.begin(115200);
  pinMode(ANGLE_PIN, INPUT);
}

void processCommand(const char* command) {
  StaticJsonDocument<200> response;
  
  if (strcmp(command, "get_angle") == 0) {
    response["angle"] = filteredAngle;
  }
  else if (strcmp(command, "calibrate") == 0) {
    // Proceso de calibración
    isCalibrated = true;
    response["status"] = "ok";
    response["message"] = "Sistema calibrado";
  }
  else if (strcmp(command, "adjust_limits") == 0) {
    // Ajustar límites basados en la posición actual
    float currentAngle = filteredAngle;
    minAngle = max(30.0, currentAngle - 10);
    maxAngle = min(135.0, currentAngle + 10);
    response["status"] = "ok";
    response["message"] = "Límites ajustados";
  }
  else if (strncmp(command, "start_", 6) == 0) {
    isExerciseActive = true;
    response["status"] = "ok";
    response["message"] = "Ejercicio iniciado";
  }
  else if (strcmp(command, "stop") == 0) {
    isExerciseActive = false;
    response["status"] = "ok";
    response["message"] = "Ejercicio detenido";
  }
  
  serializeJson(response, Serial);
  Serial.println();
}

void loop() {
  // Leer y procesar comandos si hay disponibles
  if (Serial.available()) {
    StaticJsonDocument<200> doc;
    DeserializationError error = deserializeJson(doc, Serial);
    
    if (!error) {
      const char* command = doc["command"];
      if (command) {
        processCommand(command);
      }
    }
  }
  
  // Leer el valor analógico y convertirlo a ángulo (30-135 grados)
  int rawValue = analogRead(ANGLE_PIN);
  float currentAngle = map(rawValue, 0, 1023, minAngle, maxAngle);
  
  // Aplicar filtro de paso bajo
  filteredAngle = (ALPHA * currentAngle) + ((1 - ALPHA) * filteredAngle);
  
  // Enviar ángulo periódicamente si el ejercicio está activo
  static unsigned long lastSend = 0;
  if (millis() - lastSend >= 20) {  // 50Hz
    StaticJsonDocument<64> angleDoc;
    angleDoc["angle"] = filteredAngle;
    
    serializeJson(angleDoc, Serial);
    Serial.println();
    
    lastSend = millis();
  }
} 