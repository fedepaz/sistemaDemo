// src/modules/legacy/programas/interfaces/programas.interface.ts

import { RowDataPacket } from 'mysql2/promise';

export interface LegacyProgramas extends RowDataPacket {
  nombre: string; //char(20)
  tipo: string; //char(10)
  grupo: string; //char(10)
  detalle: string; //char(50)
  notas: string; //text
  menu: string; //char(10)
  nom_menu: string; //char(50)
  pais: string; //char(10)
  menu1: string; //char(10)
  ok1: string; //char(10)
}
