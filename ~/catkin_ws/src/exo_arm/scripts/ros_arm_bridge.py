#!/usr/bin/env python3

import rospy
from std_msgs.msg import Float64, String, Bool
import serial
import json
import time
from threading import Lock
import sys
import glob
import os

class RosArmBridge:
    def __init__(self):
        rospy.init_node('ros_arm_bridge', anonymous=True)
        
        # Configuración del puerto serie
        self.port = rospy.get_param('~port', None)
        self.baudrate = rospy.get_param('~baudrate', 115200)
        self.serial_lock = Lock()
        self.ser = None
        
        # Publishers
        self.angle_pub = rospy.Publisher('angle_topic', Float64, queue_size=10)
        self.calibration_pub = rospy.Publisher('calibration_status', Bool, queue_size=10)
        
        # Subscribers
        rospy.Subscriber('exercise_control', String, self.handle_exercise_control)
        rospy.Subscriber('calibration_command', String, self.handle_calibration)
        
        # Estado del sistema
        self.is_calibrated = False
        self.current_exercise = None
        self.exercise_active = False

        # Intentar encontrar y conectar al Arduino
        self.connect_to_arduino()
        
        rospy.loginfo("ROS-Arm Bridge iniciado")
        
    def get_windows_ports(self):
        """Obtiene los puertos COM disponibles en Windows desde WSL"""
        # Buscar en /mnt/c para acceder a los puertos COM de Windows
        ports = []
        try:
            # Intentar acceder a los puertos COM a través de WSL
            for i in range(256):
                port = f"/dev/ttyS{i}"
                try:
                    s = serial.Serial(port)
                    s.close()
                    ports.append(port)
                except:
                    pass
                
            # También buscar puertos ACM (Arduino)
            ports.extend(glob.glob('/dev/ttyACM*'))
            
            rospy.loginfo(f"Puertos encontrados: {ports}")
            return ports
        except Exception as e:
            rospy.logerr(f"Error buscando puertos: {str(e)}")
            return []
        
    def connect_to_arduino(self):
        """Busca y conecta al Arduino"""
        try:
            # Obtener puertos disponibles
            available_ports = self.get_windows_ports()
            rospy.loginfo(f"Puertos disponibles: {available_ports}")
            
            # Si no se especificó un puerto, probar cada puerto disponible
            if not self.port:
                for port in available_ports:
                    try:
                        rospy.loginfo(f"Intentando conectar a {port}")
                        test_ser = serial.Serial(port, self.baudrate, timeout=1)
                        # Esperar a que Arduino se reinicie
                        time.sleep(2)
                        
                        # Enviar comando de prueba
                        test_ser.write(b'{"command": "test"}\n')
                        time.sleep(0.1)
                        response = test_ser.readline().decode().strip()
                        
                        if response:  # Si hay respuesta, asumimos que es el Arduino
                            self.port = port
                            self.ser = test_ser
                            rospy.loginfo(f"Arduino encontrado en {port}")
                            return True
                        else:
                            test_ser.close()
                    except Exception as e:
                        rospy.logwarn(f"No se pudo conectar a {port}: {str(e)}")
                        if 'test_ser' in locals():
                            test_ser.close()
            
            if not self.port:
                rospy.logerr("No se encontró ningún Arduino")
                return False
                
            # Si ya tenemos un puerto específico, intentar conectar
            if not self.ser:
                self.ser = serial.Serial(self.port, self.baudrate, timeout=1)
                time.sleep(2)  # Esperar a que Arduino se reinicie
                rospy.loginfo(f"Conectado al puerto {self.port}")
            return True
            
        except Exception as e:
            rospy.logerr(f"Error al conectar al Arduino: {str(e)}")
            self.ser = None
            return False
            
    def send_serial_command(self, command):
        """Envía un comando al Arduino de manera segura"""
        if not self.ser:
            if not self.connect_to_arduino():
                rospy.logerr("No hay conexión con el Arduino")
                return None
                
        try:
            with self.serial_lock:
                self.ser.write(f"{command}\n".encode())
                time.sleep(0.1)
                response = self.ser.readline().decode().strip()
                return response
        except Exception as e:
            rospy.logerr(f"Error en comunicación serial: {str(e)}")
            self.ser = None  # Marcar como desconectado
            return None
            
    def handle_exercise_control(self, msg):
        """Maneja los comandos de control de ejercicios"""
        if not self.ser:
            rospy.logerr("No hay conexión con el Arduino")
            return
            
        command = msg.data
        if command.startswith('start_'):
            exercise_type = command.replace('start_', '')
            self.start_exercise(exercise_type)
        elif command == 'stop':
            self.stop_exercise()
            
    def handle_calibration(self, msg):
        """Maneja los comandos de calibración"""
        if not self.ser:
            rospy.logerr("No hay conexión con el Arduino")
            return
            
        command = msg.data
        if command == 'calibrate':
            self.calibrate_system()
        elif command == 'adjust_limits':
            self.adjust_limits()
            
    def start_exercise(self, exercise_type):
        """Inicia un ejercicio específico"""
        if not self.ser:
            rospy.logerr("No hay conexión con el Arduino")
            return
            
        if not self.is_calibrated:
            rospy.logwarn("Sistema no calibrado")
            return
            
        command = {
            "command": "start_exercise",
            "type": exercise_type
        }
        
        response = self.send_serial_command(json.dumps(command))
        if response and "ok" in response.lower():
            self.current_exercise = exercise_type
            self.exercise_active = True
            rospy.loginfo(f"Ejercicio iniciado: {exercise_type}")
        else:
            rospy.logerr("Error al iniciar ejercicio")
            
    def stop_exercise(self):
        """Detiene el ejercicio actual"""
        if not self.ser:
            rospy.logerr("No hay conexión con el Arduino")
            return
            
        command = {
            "command": "stop_exercise"
        }
        
        response = self.send_serial_command(json.dumps(command))
        if response and "ok" in response.lower():
            self.current_exercise = None
            self.exercise_active = False
            rospy.loginfo("Ejercicio detenido")
        else:
            rospy.logerr("Error al detener ejercicio")
            
    def calibrate_system(self):
        """Calibra el sistema"""
        if not self.ser:
            rospy.logerr("No hay conexión con el Arduino")
            return
            
        command = {
            "command": "calibrate"
        }
        
        response = self.send_serial_command(json.dumps(command))
        if response and "ok" in response.lower():
            self.is_calibrated = True
            self.calibration_pub.publish(True)
            rospy.loginfo("Sistema calibrado")
        else:
            rospy.logerr("Error en calibración")
            
    def adjust_limits(self):
        """Ajusta los límites del sistema"""
        if not self.ser:
            rospy.logerr("No hay conexión con el Arduino")
            return
            
        command = {
            "command": "adjust_limits"
        }
        
        response = self.send_serial_command(json.dumps(command))
        if response and "ok" in response.lower():
            rospy.loginfo("Límites ajustados")
        else:
            rospy.logerr("Error al ajustar límites")
            
    def read_angle(self):
        """Lee el ángulo actual del brazo"""
        if not self.ser:
            return None
            
        command = {
            "command": "get_angle"
        }
        
        response = self.send_serial_command(json.dumps(command))
        if response:
            try:
                data = json.loads(response)
                if 'angle' in data:
                    return float(data['angle'])
            except:
                rospy.logerr("Error al parsear ángulo")
        return None
        
    def run(self):
        """Bucle principal"""
        rate = rospy.Rate(30)  # 30Hz
        
        while not rospy.is_shutdown():
            if not self.ser:
                # Intentar reconectar si no hay conexión
                if self.connect_to_arduino():
                    rospy.loginfo("Reconexión exitosa")
                else:
                    rospy.logwarn_throttle(5, "Sin conexión al Arduino")
                    rate.sleep()
                    continue
                    
            # Leer y publicar ángulo
            angle = self.read_angle()
            if angle is not None:
                self.angle_pub.publish(angle)
                
            rate.sleep()
            
    def cleanup(self):
        """Limpieza al cerrar"""
        if self.ser and self.ser.is_open:
            try:
                self.ser.close()
                rospy.loginfo("Puerto serial cerrado")
            except:
                pass

if __name__ == '__main__':
    try:
        bridge = RosArmBridge()
        bridge.run()
    except rospy.ROSInterruptException:
        pass
    finally:
        if 'bridge' in locals():
            bridge.cleanup()