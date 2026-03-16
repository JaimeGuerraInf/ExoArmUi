#!/bin/bash

# Obtener la IP de Windows desde WSL
WINDOWS_IP=$(ip route | grep default | awk '{print $3}')

# Crear el puente serial
socat PTY,link=/dev/ttyS10,raw,echo=0,waitslave TCP:$WINDOWS_IP:5000

# El script se mantendrá ejecutándose mientras el puente esté activo 