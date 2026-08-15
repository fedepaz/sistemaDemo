import { formatPartidaHeader, formatPartidaNumber, formatSpecies } from '../header';
import { LegacyHeader } from '@vivero/shared';

describe('Header Utilities', () => {
  const mockHeader: LegacyHeader = {
    partidaId: 123,
    anio: 2024,
    indice: 1,
    codigoEspecie: 'ESP001',
    nombreEspecie: 'Especie Test',
  };

  describe('formatPartidaHeader', () => {
    it('should format full header correctly', () => {
      const result = formatPartidaHeader(mockHeader);
      expect(result).toBe('#123/1 - ESP001 · Especie Test');
    });
  });

  describe('formatPartidaNumber', () => {
    it('should format partida number correctly', () => {
      const result = formatPartidaNumber(mockHeader);
      expect(result).toBe('#123/1');
    });
  });

  describe('formatSpecies', () => {
    it('should format species correctly', () => {
      const result = formatSpecies(mockHeader);
      expect(result).toBe('ESP001 · Especie Test');
    });
  });
});
