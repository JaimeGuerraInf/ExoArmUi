#!/usr/bin/env python3
import subprocess
import time
import os
import signal
import sys

def signal_handler(sig, frame):
    print("\n🛑 Deteniendo el sistema...")
    # Matar todos los procesos
    for proc in processes:
        if proc:
            proc.terminate()
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)

# Lista para mantener referencia a los procesos
processes = []

def start_system():
    try:
        # Iniciar roscore
        print("🚀 Iniciando roscore...")
        roscore = subprocess.Popen(['roscore'])
        processes.append(roscore)
        time.sleep(3)  # Esperar a que roscore esté listo

        # Iniciar rosbridge websocket
        print("🌐 Iniciando rosbridge websocket...")
        current_dir = os.path.dirname(os.path.abspath(__file__))
        workspace_dir = os.path.dirname(current_dir)
        launch_file = os.path.join(workspace_dir, 'launch', 'websocket.launch')
        websocket = subprocess.Popen(['roslaunch', launch_file])
        processes.append(websocket)
        time.sleep(2)  # Esperar a que el websocket esté listo

        # Iniciar el simulador de ejercicios
        print("🎵 Iniciando simulador de ejercicios...")
        simulator_path = os.path.join(current_dir, 'simulate_twinkle.py')
        simulator = subprocess.Popen(['python3', simulator_path])
        processes.append(simulator)

        print("\n✨ Sistema iniciado correctamente!")
        print("💡 La aplicación web debería poder conectarse ahora.")
        print("📝 Presiona Ctrl+C para detener el sistema.")

        # Mantener el script corriendo
        simulator.wait()

    except Exception as e:
        print(f"❌ Error: {str(e)}")
    finally:
        # Asegurar que todos los procesos se detengan
        for proc in processes:
            if proc:
                proc.terminate()

if __name__ == '__main__':
    start_system() 