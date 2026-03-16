#!/usr/bin/env python3

import rospy
from std_msgs.msg import Float64, String, Bool
import serial
import socket
import json
import time
from threading import Lock
import sys
import os
from urllib.parse import urlparse

class RosArmBridge:
    def __init__(self):
        rospy.init_node('ros_arm_bridge', anonymous=True)
        
        # Configuración de la conexión
        port_param = rospy.get_param('~port', 'socket://host.docker.internal:5000')
        self.baudrate = rospy.get_param('~baudrate', 115200)
        self.serial_lock = Lock()
        self.connection = None
        self.setup_connection(port_param)
        
        # Publishers
        self.angle_pub = rospy.Publisher('angle_topic', Float64, queue_size=10)
        self.calibration_pub = rospy.Publisher('calibration_status', Bool, queue_size=10)
        self.connection_pub = rospy.Publisher('connection_status', Bool, queue_size=10)
        
        # Subscribers
        rospy.Subscriber('exercise_control', String, self.handle_exercise_control)
        rospy.Subscriber('calibration_command', String, self.handle_calibration)
        
        # Estado del sistema
        self.is_calibrated = False
        self.current_exercise = None
        self.exercise_active = False
        
        rospy.loginfo("ROS-Arm Bridge iniciado")
        
    def setup_connection(self, port_param):
        """Configura la conexión serial o TCP según el parámetro"""
        try:
            if port_param.startswith('socket://'):
                # Conexión TCP
                parsed = urlparse(port_param)
                host = parsed.hostname
                port = parsed.port
                self.connection = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                self.connection.connect((host, port))
                rospy.loginfo(f"Conectado a {host}:{port}")
            else:
                # Conexión Serial
                self.connection = serial.Serial(port_param, self.baudrate, timeout=1)
                rospy.loginfo(f"Conectado al puerto {port_param}")
            
            self.connection_pub.publish(True)
            return True
        except Exception as e:
            rospy.logerr(f"Error al conectar: {e}")
            self.connection_pub.publish(False)
            return False

    def send_command(self, command):
        """Envía un comando y recibe respuesta"""
        try:
            with self.serial_lock:
                if isinstance(self.connection, serial.Serial):
                    self.connection.write(f"{command}\n".encode())
                    time.sleep(0.1)
                    response = self.connection.readline().decode().strip()
                else:
                    self.connection.send(f"{command}\n".encode())
                    response = self.connection.recv(1024).decode().strip()
                return response
        except Exception as e:
            rospy.logerr(f"Error en comunicación: {e}")
            self.connection_pub.publish(False)
            return None

    def handle_exercise_control(self, msg):
        """Maneja los comandos de control de ejercicios"""
        command = msg.data
        
        if command.startswith('start_'):
            exercise_type = command.replace('start_', '')
            self.start_exercise(exercise_type)
        elif command == 'stop':
            self.stop_exercise()
            
    def handle_calibration(self, msg):
        """Maneja los comandos de calibración"""
        command = msg.data
        
        if command == 'calibrate':
            self.calibrate_system()
        elif command == 'adjust_limits':
            self.adjust_limits()
            
    def start_exercise(self, exercise_type):
        """Inicia un ejercicio específico"""
        if not self.is_calibrated:
            rospy.logwarn("Sistema no calibrado")
            return
            
        command = {
            "command": "start_exercise",
            "type": exercise_type
        }
        
        response = self.send_command(json.dumps(command))
        if response and "ok" in response.lower():
            self.current_exercise = exercise_type
            self.exercise_active = True
            rospy.loginfo(f"Ejercicio iniciado: {exercise_type}")
        else:
            rospy.logerr("Error al iniciar ejercicio")
            
    def stop_exercise(self):
        """Detiene el ejercicio actual"""
        command = {
            "command": "stop_exercise"
        }
        
        response = self.send_command(json.dumps(command))
        if response and "ok" in response.lower():
            self.current_exercise = None
            self.exercise_active = False
            rospy.loginfo("Ejercicio detenido")
        else:
            rospy.logerr("Error al detener ejercicio")
            
    def calibrate_system(self):
        """Calibra el sistema"""
        command = {
            "command": "calibrate"
        }
        
        response = self.send_command(json.dumps(command))
        if response and "ok" in response.lower():
            self.is_calibrated = True
            self.calibration_pub.publish(True)
            rospy.loginfo("Sistema calibrado")
        else:
            rospy.logerr("Error en calibración")
            
    def adjust_limits(self):
        """Ajusta los límites del sistema"""
        command = {
            "command": "adjust_limits"
        }
        
        response = self.send_command(json.dumps(command))
        if response and "ok" in response.lower():
            rospy.loginfo("Límites ajustados")
        else:
            rospy.logerr("Error al ajustar límites")
            
    def read_angle(self):
        """Lee el ángulo actual del brazo"""
        command = {
            "command": "get_angle"
        }
        
        response = self.send_command(json.dumps(command))
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
            # Leer y publicar ángulo
            angle = self.read_angle()
            if angle is not None:
                self.angle_pub.publish(angle)
                
            rate.sleep()
            
    def cleanup(self):
        """Limpieza al cerrar"""
        if hasattr(self, 'connection') and isinstance(self.connection, serial.Serial) and self.connection.is_open:
            self.connection.close()
            rospy.loginfo("Puerto serial cerrado")

if __name__ == '__main__':
    try:
        bridge = RosArmBridge()
        bridge.run()
    except rospy.ROSInterruptException:
        pass
    finally:
        if 'bridge' in locals():
            bridge.cleanup()