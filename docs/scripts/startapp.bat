@echo off
:loop
cd /d "C:\Users\Administrador.WIN-5O8PFH87N2N\Documents\sistemaProplanta\sistemaDemo"
pnpm start
timeout /t 5
goto loop