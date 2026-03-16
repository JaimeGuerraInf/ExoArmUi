# Requiere com0com y com2tcp instalados
# COM3 es tu Arduino real
# COM10 es el puerto virtual creado por com0com

$ErrorActionPreference = "Stop"

# Ruta al ejecutable com2tcp (ajusta según tu instalación)
$com2tcp = "C:\Program Files (x86)\com0com\com2tcp.exe"

# Iniciar el puente TCP
Write-Host "Iniciando puente COM3 <-> TCP:5000"
& $com2tcp --baud 115200 --ignore-dsr \\.\COM3 5000

# El script se mantendrá ejecutándose mientras el puente esté activo 