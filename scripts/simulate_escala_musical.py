#!/usr/bin/env python3
"""
Script de simulación para el ejercicio de Escala Musical
Simula el movimiento correcto del brazo siguiendo las 8 notas de la escala
Duración total: exactamente 120 segundos (2 minutos)
"""

import rospy
from std_msgs.msg import Float64
import math
import time
import sys

class EscalaMusicaSimulator:
    def __init__(self):
        rospy.init_node('escala_musical_simulator', anonymous=True)
        self.angle_pub = rospy.Publisher('/angle_topic', Float64, queue_size=10)
        self.rate = rospy.Rate(60)  # 60 Hz para sincronización perfecta con la interfaz
        
        # Ángulos para cada nota de la escala (Do, Re, Mi, Fa, Sol, La, Si, Do)
        self.scale_angles = [
            135,  # Do (grave) - posición más baja
            120,  # Re
            105,  # Mi
            90,   # Fa
            75,   # Sol
            60,   # La
            45,   # Si
            30    # Do (agudo) - posición más alta
        ]
        
        print("🎵 Iniciando simulación de Escala Musical")
        print("⏱️  Duración total: 120 segundos (2 minutos exactos)")
        print("Presiona Ctrl+C para detener")
        print("Ángulos de la escala:", self.scale_angles)
    
    def smooth_transition(self, start_angle, end_angle, duration=2.0):
        """Transición suave entre dos ángulos"""
        steps = int(duration * 60)  # 60 Hz para mejor sincronización
        
        for i in range(steps):
            progress = i / float(steps - 1)
            # Usar función suave (ease-in-out)
            smooth_progress = 0.5 * (1 - math.cos(progress * math.pi))
            current_angle = start_angle + (end_angle - start_angle) * smooth_progress
            
            # Añadir pequeña variación natural (temblor humano)
            natural_variation = math.sin(time.time() * 10) * 0.5
            final_angle = current_angle + natural_variation
            
            # Publicar ángulo
            angle_msg = Float64()
            angle_msg.data = final_angle
            self.angle_pub.publish(angle_msg)
            
            self.rate.sleep()
    
    def hold_position(self, angle, duration=1.0):
        """Mantener una posición por un tiempo determinado"""
        steps = int(duration * 60)  # 60 Hz
        
        for i in range(steps):
            # Pequeña variación para simular estabilización humana
            variation = math.sin(time.time() * 8) * 0.3
            final_angle = angle + variation
            
            angle_msg = Float64()
            angle_msg.data = final_angle
            self.angle_pub.publish(angle_msg)
            
            self.rate.sleep()
    
    def run_exercise(self):
        """Ejecutar el ejercicio completo de escala musical - 120 segundos exactos"""
        try:
            start_time = time.time()
            current_angle = 90  # Posición inicial en el centro
            
            # Movimiento inicial a la posición de inicio (5 segundos)
            print("📍 Moviendo a posición inicial... (5s)")
            self.smooth_transition(current_angle, self.scale_angles[0], 5.0)
            current_angle = self.scale_angles[0]
            
            # Ejecutar 3 ciclos completos de la escala (108 segundos total)
            # Cada ciclo: 36 segundos (18s ascendente + 14s descendente + 4s pausa)
            for cycle in range(3):
                print(f"\n🎼 Ciclo {cycle + 1}/3 (36 segundos)")
                
                # Escala ascendente (18 segundos: 8 notas × 2.25s cada una)
                print("⬆️  Escala ascendente (18s):")
                for i, target_angle in enumerate(self.scale_angles):
                    note_names = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si', 'Do']
                    print(f"   🎵 {note_names[i]} ({target_angle}°)")
                    
                    self.smooth_transition(current_angle, target_angle, 1.25)
                    self.hold_position(target_angle, 1.0)
                    current_angle = target_angle
                
                # Pausa entre ascendente y descendente (2 segundos)
                print("   ⏸️  Pausa intermedia (2s)...")
                self.hold_position(current_angle, 2.0)
                
                # Escala descendente (14 segundos: 7 notas × 2s cada una)
                print("⬇️  Escala descendente (14s):")
                for i, target_angle in enumerate(reversed(self.scale_angles[:-1])):
                    note_names = ['Si', 'La', 'Sol', 'Fa', 'Mi', 'Re', 'Do']
                    print(f"   🎵 {note_names[i]} ({target_angle}°)")
                    
                    self.smooth_transition(current_angle, target_angle, 1.0)
                    self.hold_position(target_angle, 1.0)
                    current_angle = target_angle
                
                # Pausa entre ciclos (2 segundos, excepto el último)
                if cycle < 2:
                    print("   ⏸️  Pausa entre ciclos (2s)...")
                    self.hold_position(current_angle, 2.0)
            
            # Volver a posición neutral (7 segundos finales)
            print("\n🏁 Finalizando ejercicio... (7s)")
            self.smooth_transition(current_angle, 90, 5.0)
            self.hold_position(90, 2.0)
            
            # Mostrar tiempo total
            total_time = time.time() - start_time
            print(f"✅ Ejercicio de Escala Musical completado!")
            print(f"⏱️  Tiempo total: {total_time:.1f} segundos")
            
        except rospy.ROSInterruptException:
            print("\n⏹️  Simulación interrumpida por el usuario")
        except KeyboardInterrupt:
            print("\n⏹️  Simulación interrumpida por el usuario")

if __name__ == '__main__':
    try:
        simulator = EscalaMusicaSimulator()
        simulator.run_exercise()
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1) 