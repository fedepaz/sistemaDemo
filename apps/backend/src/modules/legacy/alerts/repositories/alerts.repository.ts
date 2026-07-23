// src/modules/legacy/alerts/repositories/alerts.repository.ts

import { Injectable } from '@nestjs/common';
import {
  LegacySiembraRetrasada,
  LegacyFaltaGerminacion,
  LegacyFaltantePlantas,
  LegacyFaltaPreExpedicion,
} from '../interfaces/alerts.interface';

@Injectable()
export class AlertsRepository {
  // eslint-disable-next-line @typescript-eslint/require-await
  async findSiembraRetrasada(): Promise<LegacySiembraRetrasada[]> {
    return [
      {
        partida: 1045,
        ano: 2026,
        indice: 1,
        espvar: 'EUC01',
        especieNombre: 'Eucalipto Grandis',
        f_siem: '2026-06-01',
        contenedor: 'Ban Plastico',
        con: 48,
      } as LegacySiembraRetrasada,
      {
        partida: 2087,
        ano: 2026,
        indice: 1,
        espvar: 'OLI03',
        especieNombre: 'Olivo Arbequina',
        f_siem: '2026-06-15',
        contenedor: 'Bandeja 200',
        con: 200,
      } as LegacySiembraRetrasada,
      {
        partida: 3012,
        ano: 2026,
        indice: 2,
        espvar: 'LIM02',
        especieNombre: 'Limonero Volkameriano',
        f_siem: '2026-07-01',
        contenedor: 'Ban Plastico',
        con: 96,
      } as LegacySiembraRetrasada,
    ];
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async findFaltaGerminacion(): Promise<LegacyFaltaGerminacion[]> {
    return [
      {
        partida: 1050,
        ano: 2026,
        indice: 1,
        espvar: 'ROS01',
        especieNombre: 'Rosa Hybrid Tea',
        contenedor: 'Bandeja 104',
        invernadero: 'Invernadero 3',
      } as LegacyFaltaGerminacion,
      {
        partida: 2091,
        ano: 2026,
        indice: 1,
        espvar: 'PIN02',
        especieNombre: 'Pino Elliottii',
        contenedor: 'Ban Plastico',
        invernadero: 'Invernadero 1',
      } as LegacyFaltaGerminacion,
    ];
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async findFaltantePlantas(): Promise<LegacyFaltantePlantas[]> {
    return [
      {
        partida: 1048,
        ano: 2026,
        indice: 1,
        espvar: 'EUC01',
        especieNombre: 'Eucalipto Grandis',
        solicitadas: 500,
        germinadasTotales: 320,
        invernadero: 'Invernadero 2',
      } as LegacyFaltantePlantas,
      {
        partida: 2095,
        ano: 2026,
        indice: 1,
        espvar: 'CAS03',
        especieNombre: 'Casiopea',
        solicitadas: 200,
        germinadasTotales: 145,
        invernadero: 'Invernadero 1',
      } as LegacyFaltantePlantas,
      {
        partida: 3015,
        ano: 2026,
        indice: 2,
        espvar: 'OLI03',
        especieNombre: 'Olivo Arbequina',
        solicitadas: 300,
        germinadasTotales: 280,
        invernadero: 'Invernadero 4',
      } as LegacyFaltantePlantas,
    ];
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async findFaltaPreExpedicion(): Promise<LegacyFaltaPreExpedicion[]> {
    return [
      {
        partida: 1052,
        ano: 2026,
        indice: 1,
        espvar: 'LIM02',
        especieNombre: 'Limonero Volkameriano',
        fechaEntrega: '2026-07-20',
        invernadero: 'Invernadero 3',
      } as LegacyFaltaPreExpedicion,
      {
        partida: 2093,
        ano: 2026,
        indice: 1,
        espvar: 'ROS01',
        especieNombre: 'Rosa Hybrid Tea',
        fechaEntrega: '2026-07-25',
        invernadero: 'Invernadero 1',
      } as LegacyFaltaPreExpedicion,
    ];
  }
}
