#!/usr/bin/env python3

import rospy
from std_msgs.msg import Float64
import time
import signal
import sys
import random
from math import pi, sin

def signal_handler(sig, frame):
    rospy.loginfo("🛑 Deteniendo simulación...")
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)

class ArduinoArmSimulator:
    def __init__(self):
        rospy.init_node('arduino_arm_simulator', anonymous=True)
        self.pub = rospy.Publisher('/angle_topic', Float64, queue_size=10)
        self.rate = rospy.Rate(20)  # 20Hz - similar a la velocidad de lectura del Arduino
        self.current_angle = 30  # Ángulo inicial
        self.is_moving = False
        self.target_reached = False
        self.movement_error = 2.0  # Error base en grados
        
    def add_mechanical_noise(self, angle):
        """Añade ruido mecánico realista"""
        # Ruido base del sensor
        sensor_noise = random.uniform(-0.5, 0.5)
        
        # Ruido mecánico que aumenta con el ángulo
        mechanical_noise = random.uniform(-0.2, 0.2) * (angle / 30.0)
        
        # Ocasionalmente añade un pequeño salto (simulando fricción)
        if random.random() < 0.05:  # 5% de probabilidad
            mechanical_noise += random.uniform(-1.0, 1.0)
            
        return angle + sensor_noise + mechanical_noise

    def move_to_angle(self, target_angle, speed=8):
        """Mueve el brazo al ángulo objetivo con características realistas"""
        self.is_moving = True
        self.target_reached = False
        
        # Calcular dirección y paso
        direction = 1 if target_angle > self.current_angle else -1
        base_step = speed * direction
        
        # Tiempo máximo para el movimiento (5 segundos)
        start_time = time.time()
        max_time = 5.0
        
        while not rospy.is_shutdown() and time.time() - start_time < max_time:
            # Distancia al objetivo
            distance = abs(target_angle - self.current_angle)
            
            if distance < self.movement_error:
                self.target_reached = True
                break
                
            # Ajustar velocidad según la distancia
            if distance < 10:
                # Movimiento más lento cerca del objetivo
                actual_step = base_step * (distance / 10.0)
            else:
                # Velocidad normal con variación aleatoria
                actual_step = base_step * random.uniform(0.8, 1.2)
            
            # Actualizar ángulo
            self.current_angle += actual_step
            
            # Añadir comportamiento realista
            noisy_angle = self.add_mechanical_noise(self.current_angle)
            
            # Publicar ángulo
            msg = Float64()
            msg.data = float(noisy_angle)
            self.pub.publish(msg)
            
            self.rate.sleep()
        
        self.is_moving = False
        return self.target_reached

    def simulate_escala_musical(self):
        """Simula el ejercicio de escala musical"""
        sequence = [
            30,  # Do
            45,  # Re
            60,  # Mi
            75,  # Fa
            90,  # Sol
            105, # La
            120  # Si
        ]
        
        # Subir la escala
        for angle in sequence:
            if rospy.is_shutdown():
                return
            self.move_to_angle(angle)
            rospy.sleep(1.0)  # Mantener la nota
            
        # Bajar la escala
        for angle in reversed(sequence):
            if rospy.is_shutdown():
                return
            self.move_to_angle(angle)
            rospy.sleep(1.0)  # Mantener la nota

    def simulate_twinkle(self):
        """Simula Twinkle Twinkle Little Star"""
        sequence = [
            30,  # Do
            30,  # Do
            90,  # Sol
            90,  # Sol
            120, # La
            120, # La
            90,  # Sol
            75,  # Fa
            75,  # Fa
            60,  # Mi
            60,  # Mi
            45,  # Re
            45,  # Re
            30   # Do
        ]
        
        for angle in sequence:
            if rospy.is_shutdown():
                return
            self.move_to_angle(angle)
            rospy.sleep(1.0)  # Mantener la nota

    def simulate_mary(self):
        """Simula Mary Had a Little Lamb"""
        sequence = [
            80,  # Mi
            60,  # Re
            30,  # Do
            60,  # Re
            80,  # Mi
            80,  # Mi
            80,  # Mi
            60,  # Re
            60,  # Re
            60,  # Re
            80,  # Mi
            80,  # Mi
            80   # Mi
        ]
        
        for angle in sequence:
            if rospy.is_shutdown():
                return
            self.move_to_angle(angle)
            rospy.sleep(1.0)  # Mantener la nota

    def run_exercise(self):
        """Ejecuta el ejercicio seleccionado"""
        try:
            rospy.loginfo("🦾 Iniciando simulación del brazo Arduino")
            
            # Publicar ángulo inicial constantemente hasta que se seleccione un ejercicio
            rospy.loginfo("⏳ Esperando selección de ejercicio...")
            while not rospy.is_shutdown():
                msg = Float64()
                msg.data = float(self.add_mechanical_noise(self.current_angle))
                self.pub.publish(msg)
                self.rate.sleep()
                
                # Aquí podrías agregar lógica para detectar cuándo se selecciona un ejercicio
                # Por ahora, ejecutaremos la escala musical como ejemplo
                self.simulate_escala_musical()
                rospy.sleep(2.0)  # Pausa entre repeticiones
                
                # También puedes probar las otras canciones:
                # self.simulate_twinkle()
                # self.simulate_mary()
            
        except rospy.ROSInterruptException:
            rospy.loginfo("⚠️ Simulación interrumpida")
        except Exception as e:
            rospy.logerr(f"❌ Error: {str(e)}")
        finally:
            rospy.loginfo("🏁 Simulación finalizada")

def main():
    simulator = ArduinoArmSimulator()
    simulator.run_exercise()

if __name__ == "__main__":
    main() 