#!/usr/bin/env python3
"""
Script de simulación para el ejercicio de Twinkle Twinkle Little Star
Simula el movimiento correcto del brazo siguiendo la melodía completa
Duración total: exactamente 150 segundos (2.5 minutos)
"""

import rospy
from std_msgs.msg import Float64
import math
import time
import sys

class TwinkleTwinkleSimulator:
    def __init__(self):
        rospy.init_node('twinkle_twinkle_simulator', anonymous=True)
        self.angle_pub = rospy.Publisher('/angle_topic', Float64, queue_size=10)
        self.rate = rospy.Rate(60)  # 60 Hz para sincronización perfecta con la interfaz
        
        # Secuencia de notas: C-C-G-G-A-A-G, F-F-E-E-D-D-C
        self.melody_notes = ['C', 'C', 'G', 'G', 'A', 'A', 'G', 'F', 'F', 'E', 'E', 'D', 'D', 'C']
        
        # Mapeo de notas a ángulos (basado en el patrón ondulado del ejercicio)
        self.note_angles = {
            'C': 110,   # Do - posición media-baja
            'D': 95,    # Re
            'E': 80,    # Mi
            'F': 65,    # Fa
            'G': 50,    # Sol - posición alta
            'A': 35     # La - posición más alta
        }
        
        print("🎵 Iniciando simulación de Twinkle Twinkle Little Star")
        print("⏱️  Duración total: 150 segundos (2.5 minutos exactos)")
        print("Presiona Ctrl+C para detener")
        print("Melodía:", ' '.join(self.melody_notes))
    
    def smooth_transition(self, start_angle, end_angle, duration=1.0):
        """Transición suave entre dos ángulos con vibrato musical"""
        steps = int(duration * 60)  # 60 Hz para mejor sincronización
        
        for i in range(steps):
            progress = i / float(steps - 1)
            # Usar función suave (ease-in-out)
            smooth_progress = 0.5 * (1 - math.cos(progress * math.pi))
            current_angle = start_angle + (end_angle - start_angle) * smooth_progress
            
            # Añadir vibrato musical suave
            vibrato = math.sin(time.time() * 12) * 0.8
            # Variación natural humana
            natural_variation = math.sin(time.time() * 8) * 0.4
            
            final_angle = current_angle + vibrato + natural_variation
            
            # Publicar ángulo
            angle_msg = Float64()
            angle_msg.data = final_angle
            self.angle_pub.publish(angle_msg)
            
            self.rate.sleep()
    
    def hold_note(self, angle, duration=0.8):
        """Mantener una nota con vibrato musical"""
        steps = int(duration * 60)  # 60 Hz
        
        for i in range(steps):
            # Vibrato musical más pronunciado durante las notas sostenidas
            vibrato = math.sin(time.time() * 15) * 1.2
            # Pequeña variación natural
            variation = math.sin(time.time() * 6) * 0.3
            
            final_angle = angle + vibrato + variation
            
            angle_msg = Float64()
            angle_msg.data = final_angle
            self.angle_pub.publish(angle_msg)
            
            self.rate.sleep()
    
    def play_phrase(self, notes, phrase_name, phrase_duration):
        """Tocar una frase de la melodía con duración específica"""
        print(f"🎼 {phrase_name} ({phrase_duration}s)")
        
        if not notes:
            return self.note_angles['C']
        
        current_angle = self.note_angles[notes[0]]
        note_time = phrase_duration / len(notes)  # Tiempo por nota
        
        for i, note in enumerate(notes):
            target_angle = self.note_angles[note]
            print(f"   🎵 {note} ({target_angle}°)")
            
            # Transición suave a la nota (30% del tiempo de nota)
            transition_time = note_time * 0.3
            if i > 0:  # No hacer transición en la primera nota de la frase
                self.smooth_transition(current_angle, target_angle, transition_time)
            
            # Sostener la nota (70% del tiempo de nota)
            hold_time = note_time * 0.7
            self.hold_note(target_angle, hold_time)
            
            current_angle = target_angle
        
        return current_angle
    
    def run_exercise(self):
        """Ejecutar el ejercicio completo de Twinkle Twinkle - 150 segundos exactos"""
        try:
            start_time = time.time()
            
            # Posición inicial (5 segundos)
            initial_angle = 90
            print("📍 Moviendo a posición inicial... (5s)")
            self.smooth_transition(initial_angle, self.note_angles['C'], 5.0)
            current_angle = self.note_angles['C']
            
            # Ejecutar 2 repeticiones completas (120 segundos total)
            for repetition in range(2):
                print(f"\n🌟 Repetición {repetition + 1}/2 (60 segundos)")
                
                # Primera frase: "Twinkle twinkle little star" (25 segundos)
                first_phrase = self.melody_notes[:7]  # C-C-G-G-A-A-G
                current_angle = self.play_phrase(first_phrase, "Twinkle twinkle little star", 25.0)
                
                # Pausa entre frases (5 segundos)
                print("   ⏸️  Pausa entre frases (5s)...")
                self.hold_note(current_angle, 5.0)
                
                # Segunda frase: "How I wonder what you are" (30 segundos)
                second_phrase = self.melody_notes[7:]  # F-F-E-E-D-D-C
                current_angle = self.play_phrase(second_phrase, "How I wonder what you are", 30.0)
                
                # Pausa entre repeticiones (0 segundos para la última)
                if repetition < 1:
                    print("   ⏸️  Pausa entre repeticiones (0s)...")
                    # Sin pausa para ajustar timing
            
            # Variación final expresiva (20 segundos)
            print(f"\n✨ Variación final expresiva (20s)")
            
            # Tocar la melodía completa con más expresión
            note_time = 20.0 / len(self.melody_notes)
            for i, note in enumerate(self.melody_notes):
                target_angle = self.note_angles[note]
                print(f"   🎭 {note} ({target_angle}°) - expresivo")
                
                # Transiciones más dramáticas
                transition_time = note_time * 0.4
                if i > 0:
                    self.smooth_transition(current_angle, target_angle, transition_time)
                
                # Notas sostenidas con más vibrato
                hold_time = note_time * 0.6
                self.hold_note(target_angle, hold_time)
                
                current_angle = target_angle
            
            # Finalización elegante (5 segundos)
            print("\n🏁 Finalizando con flourish... (5s)")
            self.smooth_transition(current_angle, 90, 3.0)
            self.hold_note(90, 2.0)
            
            # Mostrar tiempo total
            total_time = time.time() - start_time
            print(f"✅ Twinkle Twinkle Little Star completado!")
            print(f"⏱️  Tiempo total: {total_time:.1f} segundos")
            
        except rospy.ROSInterruptException:
            print("\n⏹️  Simulación interrumpida por el usuario")
        except KeyboardInterrupt:
            print("\n⏹️  Simulación interrumpida por el usuario")

if __name__ == '__main__':
    try:
        simulator = TwinkleTwinkleSimulator()
        simulator.run_exercise()
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1) 