import serial
import socket
import threading
import time

def serial_to_network(ser, conn):
    try:
        while True:
            # Leer del puerto serial
            data = ser.read(1024)
            if data:
                # Enviar a la red
                conn.send(data)
    except:
        pass

def network_to_serial(conn, ser):
    try:
        while True:
            # Leer de la red
            data = conn.recv(1024)
            if data:
                # Enviar al puerto serial
                ser.write(data)
    except:
        pass

def main():
    # Configuración del puerto serial
    ser = serial.Serial(
        port='COM3',  # Tu puerto Arduino
        baudrate=115200,
        timeout=1
    )

    # Configuración del servidor
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.bind(('0.0.0.0', 5000))
    server.listen(1)

    print("Esperando conexión en el puerto 5000...")
    
    while True:
        try:
            # Esperar conexión
            conn, addr = server.accept()
            print(f"Conectado desde {addr}")

            # Crear hilos para la comunicación bidireccional
            thread1 = threading.Thread(target=serial_to_network, args=(ser, conn))
            thread2 = threading.Thread(target=network_to_serial, args=(conn, ser))

            thread1.daemon = True
            thread2.daemon = True

            thread1.start()
            thread2.start()

            # Mantener la conexión viva
            while True:
                time.sleep(1)

        except KeyboardInterrupt:
            print("\nCerrando conexión...")
            break
        except:
            print("Conexión perdida, esperando nueva conexión...")
            time.sleep(1)
            continue

    ser.close()
    server.close()

if __name__ == '__main__':
    main() 