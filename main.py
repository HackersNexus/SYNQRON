import os
import sys
import subprocess


def save_operation() :
    with open("operation","w") as file :
         file.write("001")
def install(p) :
    os.system(p)

with open("operation", "r") as file :
     numerical_value = file.read()

if not "001" in numerical_value :
   while True :
     op = input("Enter the device type (termux, linux) :")
     if op == "termux" or op == "Termux" or  op == "0":
      install("apt update -y")
      install("apt upgrade -y")
      install("pkg update -y")
      install("pkg upgrade -y")
      install("pkg install nodejs -y")
      install("pkg install php -y")
      install("npm install @whiskeysockets/baileys qrcode express cors pino")
      install("npm install qrcode")
      install("npm install express")
      install("npm install cors")
      install("apt install cloudflared -y")
      save_operation()
      break
     elif op == "linux" or op == "Linux" or  op == "2" :
      install("apt update -y")
      install("apt upgrade -y")
      install("apt install nodejs -y")
      install("apt install php -y")
      install("npm install @whiskeysockets/baileys qrcode express cors pino")
      install("npm install qrcode")
      install("npm install express")
      install("npm install cors")
      install("apt update -y")
      install("apt upgrade -y")
      save_operation()
      break
else :
   php_server = subprocess.Popen(["php", "-S", "localhost:5000"])
   bot_script = subprocess.Popen(["node", "bot.js"])
   cloud = subprocess.Popen(["cloudflared", "tunnel", "--url", "localhost:5000"])
   php_server.wait()
   bot_script.wait()
   cloud.wait()
