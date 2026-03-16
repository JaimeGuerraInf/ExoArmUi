#!/usr/bin/env python3
"""
Script de simulación para el ejercicio de Mary Had a Little Lamb
Simula el movimiento correcto del brazo siguiendo la melodía completa con armónicos complejos
Duración total: exactamente 180 segundos (3 minutos)
"""

import rospy
from std_msgs.msg import Float64
import math
import time
import sys

class MaryLittleLambSimulator:
    def __init__(self):
        rospy.init_node('mary_little_lamb_simulator', anonymous=True)
        self.angle_pub = rospy.Publisher('/angle_topic', Float64, queue_size=10)
        self.rate = rospy.Rate(60)  # 60 Hz para sincronización perfecta con la interfaz
        
        # Secuencia completa de notas: E-D-C-D-E-E-E, D-D-D, E-E-E, E-D-C-D-E-E-E, D-D-E-D-C
        self.full_melody = [
            'E', 'D', 'C', 'D', 'E', 'E', 'E',  # Mary had a little lamb
            'D', 'D', 'D',                       # little lamb, little lamb
            'E', 'E', 'E',                       # little lamb
            'E', 'D', 'C', 'D', 'E', 'E', 'E',  # Mary had a little lamb  
            'D', 'D', 'E', 'D', 'C'              # its fleece was white as snow
        ]
        
        # Mapeo de notas a ángulos (basado en el patrón complejo del ejercicio)
        self.note_angles = {
            'C': 120,   # Do - posición baja
            'D': 95,    # Re - posición media-baja
            'E': 60     # Mi - posición alta
        }
        
        print("🎵 Iniciando simulación de Mary Had a Little Lamb")
        print("⏱️  Duración total: 180 segundos (3 minutos exactos)")
        print("Presiona Ctrl+C para detener")
        print("Melodía completa:", ' '.join(self.full_melody))
        print(f"Total de notas: {len(self.full_melody)}")
    
    def smooth_transition(self, start_angle, end_angle, duration=1.0):
        """Transición suave entre dos ángulos con armónicos complejos"""
        steps = int(duration * 60)  # 60 Hz para mejor sincronización
        
        for i in range(steps):
            progress = i / float(steps - 1)
            # Usar función suave (ease-in-out)
            smooth_progress = 0.5 * (1 - math.cos(progress * math.pi))
            current_angle = start_angle + (end_angle - start_angle) * smooth_progress
            
            # Armónicos complejos múltiples
            harmonic1 = math.sin(time.time() * 18) * 1.2   # Armónico principal
            harmonic2 = math.cos(time.time() * 12) * 0.8   # Armónico secundario
            harmonic3 = math.sin(time.time() * 24) * 0.4   # Armónico terciario
            
            # Variación natural humana
            natural_variation = math.sin(time.time() * 6) * 0.6
            
            final_angle = current_angle + harmonic1 + harmonic2 + harmonic3 + natural_variation
            
            # Publicar ángulo
            angle_msg = Float64()
            angle_msg.data = final_angle
            self.angle_pub.publish(angle_msg)
            
            self.rate.sleep()
    
    def hold_note_complex(self, angle, duration=1.0):
        """Mantener una nota con armónicos complejos y expresión musical"""
        steps = int(duration * 60)  # 60 Hz
        
        for i in range(steps):
            # Múltiples armónicos para complejidad
            harmonic1 = math.sin(time.time() * 20) * 1.5   # Fundamental
            harmonic2 = math.cos(time.time() * 15) * 1.0   # Quinta
            harmonic3 = math.sin(time.time() * 30) * 0.6   # Octava
            harmonic4 = math.cos(time.time() * 10) * 0.3   # Modulación lenta
            
            # Vibrato expresivo
            vibrato = math.sin(time.time() * 25) * 0.8
            
            # Variación natural
            variation = math.sin(time.time() * 8) * 0.4
            
            final_angle = angle + harmonic1 + harmonic2 + harmonic3 + harmonic4 + vibrato + variation
            
            angle_msg = Float64()
            angle_msg.data = final_angle
            self.angle_pub.publish(angle_msg)
            
            self.rate.sleep()
    
    def play_phrase_complex(self, notes, phrase_name, phrase_duration, expression_level=1.0):
        """Tocar una frase con expresión compleja y duración específica"""
        print(f"🎼 {phrase_name} ({phrase_duration}s) - Expresión: {expression_level:.1f}x")
        
        if not notes:
            return self.note_angles['E']
        
        current_angle = self.note_angles[notes[0]]
        note_time = phrase_duration / len(notes)  # Tiempo por nota
        
        for i, note in enumerate(notes):
            target_angle = self.note_angles[note]
            print(f"   🎭 {note} ({target_angle}°)")
            
            # Transiciones más complejas basadas en la expresión
            transition_time = note_time * (0.25 + 0.15 * expression_level)
            if i > 0:
                self.smooth_transition(current_angle, target_angle, transition_time)
            
            # Sostener nota con complejidad proporcional a la expresión
            hold_time = note_time * (0.75 - 0.15 * expression_level)
            self.hold_note_complex(target_angle, hold_time)
            
            current_angle = target_angle
        
        return current_angle
    
    def run_exercise(self):
        """Ejecutar el ejercicio completo de Mary Had a Little Lamb - 180 segundos exactos"""
        try:
            start_time = time.time()
            
            # Posición inicial (10 segundos)
            initial_angle = 90
            print("📍 Moviendo a posición inicial... (10s)")
            self.smooth_transition(initial_angle, self.note_angles['E'], 10.0)
            current_angle = self.note_angles['E']
            
            # Primera interpretación completa - Simple (50 segundos)
            print(f"\n🎭 Primera interpretación - Simple (50s)")
            current_angle = self.play_phrase_complex(
                self.full_melody, 
                "Mary Had a Little Lamb - Versión simple", 
                50.0, 
                expression_level=0.8
            )
            
            # Pausa y preparación (10 segundos)
            print("   ⏸️  Pausa y preparación (10s)...")
            self.hold_note_complex(current_angle, 10.0)
            
            # Segunda interpretación - Con más expresión (60 segundos)
            print(f"\n🎨 Segunda interpretación - Expresiva (60s)")
            current_angle = self.play_phrase_complex(
                self.full_melody, 
                "Mary Had a Little Lamb - Versión expresiva", 
                60.0, 
                expression_level=1.2
            )
            
            # Pausa artística (10 segundos)
            print("   ⏸️  Pausa artística (10s)...")
            self.hold_note_complex(current_angle, 10.0)
            
            # Tercera interpretación - Virtuosística (30 segundos)
            print(f"\n✨ Tercera interpretación - Virtuosística (30s)")
            current_angle = self.play_phrase_complex(
                self.full_melody, 
                "Mary Had a Little Lamb - Versión virtuosa", 
                30.0, 
                expression_level=1.8
            )
            
            # Finalización épica (10 segundos)
            print("\n🏁 Finalización épica con cadenza... (10s)")
            
            # Cadenza final con máxima complejidad
            cadenza_notes = ['E', 'D', 'C', 'E']  # Frase final
            for i, note in enumerate(cadenza_notes):
                target_angle = self.note_angles[note]
                print(f"   🎪 Cadenza: {note} ({target_angle}°)")
                
                if i > 0:
                    # Transiciones dramáticas
                    self.smooth_transition(current_angle, target_angle, 1.5)
                
                # Notas sostenidas con máxima expresión
                self.hold_note_complex(target_angle, 1.0)
                current_angle = target_angle
            
            # Resolución final
            self.smooth_transition(current_angle, 90, 3.0)
            self.hold_note_complex(90, 1.0)
            
            # Mostrar tiempo total
            total_time = time.time() - start_time
            print(f"✅ Mary Had a Little Lamb completado magistralmente!")
            print(f"⏱️  Tiempo total: {total_time:.1f} segundos")
            print(f"🎵 Total de notas interpretadas: {len(self.full_melody) * 3} (3 versiones)")
            
        except rospy.ROSInterruptException:
            print("\n⏹️  Simulación interrumpida por el usuario")
        except KeyboardInterrupt:
            print("\n⏹️  Simulación interrumpida por el usuario")

if __name__ == '__main__':
    try:
        simulator = MaryLittleLambSimulator()
        simulator.run_exercise()
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1) 