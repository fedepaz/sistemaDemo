import { AlertBaseDtoSchema, AlertBaseDto } from '../alerts.schema';
import { LegacyHeader } from '../legacy-header.schema';

describe('AlertBaseDtoSchema', () => {
  it('should extend LegacyHeaderSchema', () => {
    const validAlert = {
      partidaId: 123,
      anio: 2024,
      indice: 1,
      codigoEspecie: 'ESP001',
      nombreEspecie: 'Especie Test',
      commentCount: 5,
    };

    const result = AlertBaseDtoSchema.safeParse(validAlert);
    expect(result.success).toBe(true);
  });

  it('should be assignable to LegacyHeader type', () => {
    const alert: AlertBaseDto = {
      partidaId: 123,
      anio: 2024,
      indice: 1,
      codigoEspecie: 'ESP001',
      nombreEspecie: 'Especie Test',
      commentCount: 5,
    };

    const header: LegacyHeader = alert;
    expect(header.partidaId).toBe(123);
  });
});
