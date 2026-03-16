#!/usr/bin/env python3
"""
Lee angulos del Arduino por COM3 y los envia al tcp_ros_bridge.py en WSL (puerto 9999).
"""
import serial
import socket
import json
import time
import sys

SERIAL_PORT = 'COM3'
BAUD_RATE = 115200

# IP de WSL - se detecta automaticamente
def get_wsl_ip():
    import subprocess
    result = subprocess.run(
        ['wsl', 'hostname', '-I'],
        capture_output=True, text=True
    )
    ip = result.stdout.strip().split()[0]
    return ip

def main():
    wsl_ip = get_wsl_ip()
    print(f"IP de WSL detectada: {wsl_ip}")

    print(f"Conectando al Arduino en {SERIAL_PORT}...")
    try:
        ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=2)
        time.sleep(2)
        print(f"Arduino conectado en {SERIAL_PORT}")
    except Exception as e:
        print(f"Error al abrir {SERIAL_PORT}: {e}")
        sys.exit(1)

    print(f"Conectando a WSL tcp_ros_bridge en {wsl_ip}:9999...")
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.connect((wsl_ip, 9999))
        print(f"Conectado a WSL. Enviando angulos...")
    except Exception as e:
        print(f"Error al conectar a WSL: {e}")
        print("Asegurate de que tcp_ros_bridge.py esta corriendo en WSL.")
        sys.exit(1)

    while True:
        try:
            line = ser.readline().decode('utf-8', errors='ignore').strip()
            if not line:
                continue
            data = json.loads(line)
            if 'angle' in data:
                angle = float(data['angle'])
                sock.send(f"{angle}\n".encode())
                print(f"Angulo enviado: {angle:.2f}")
        except json.JSONDecodeError:
            pass  # Ignorar lineas no-JSON del Arduino
        except Exception as e:
            print(f"Error: {e}")
            break

    ser.close()
    sock.close()

if __name__ == '__main__':
    main()
