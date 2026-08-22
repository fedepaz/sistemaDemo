import { render, screen } from '@testing-library/react';
import { ExtendidosViewForm } from '../extendido-view-form';
import type { ExtendidoDto } from '@vivero/shared';

describe('ExtendidosViewForm', () => {
  const mockExtendido: ExtendidoDto = {
    partidaId: 123,
    anio: 2024,
    indice: 1,
    codigoEspecie: 'ESP001',
    nombreEspecie: 'Especie Test',
    hai: 'H',
    nrocont: '50',
    injerto: 'N',
    codigoCamaraGerminacion: 7,
    fechaSugeridaSiembra: '2024-03-15',
    fechaSiembraReal: '2024-03-15',
    diasEnCamara: 30,
    fechaEgresoCamara: '2024-04-14',
    extendido: 'Sin observaciones',
    codigoUbicacion: null,
    nombreUbicacion: null,
    stockInicial: 100,
    detalle: null,
    baja: null,
  };

  it('should display header in consistent format', () => {
    render(
      <ExtendidosViewForm selectedExtendido={mockExtendido} />
    );

    expect(screen.getByText('#123/1 - ESP001 · Especie Test')).toBeInTheDocument();
  });
});
