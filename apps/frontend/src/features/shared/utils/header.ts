import { LegacyHeader } from '@vivero/shared';

export function formatPartidaHeader(header: LegacyHeader): string {
  return `#${header.partidaId}/${header.indice} - ${header.codigoEspecie} · ${header.nombreEspecie}`;
}

export function formatPartidaNumber(header: LegacyHeader): string {
  return `#${header.partidaId}/${header.indice}`;
}

export function formatSpecies(header: LegacyHeader): string {
  return `${header.codigoEspecie} · ${header.nombreEspecie}`;
}
