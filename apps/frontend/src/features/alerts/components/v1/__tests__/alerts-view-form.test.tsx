import { render, screen } from '@testing-library/react';
import { AlertsViewForm } from '../alerts-view-form';
import type { AlertBaseDto } from '@vivero/shared';
import type { AlertType } from '@/features/alerts/types';

jest.mock('@/features/auth/providers/AuthProvider', () => ({
  useAuthContext: () => ({
    userProfile: {
      id: 'user-1',
      firstName: 'Test',
      lastName: 'User',
    },
  }),
}));

jest.mock('@/features/alerts/hooks/useAlertComments', () => ({
  useAlertComments: () => ({
    data: [],
    isPending: false,
  }),
}));

describe('AlertsViewForm', () => {
  const mockAlert: AlertBaseDto = {
    partidaId: 123,
    anio: 2024,
    indice: 1,
    codigoEspecie: 'ESP001',
    nombreEspecie: 'Especie Test',
    commentCount: 0,
  };

  it('should display header in consistent format', () => {
    render(
      <AlertsViewForm
        selectedAlert={mockAlert}
        alertType="SIEMBRA_RETRASADA"
      />
    );

    expect(screen.getByText('#123/1 - ESP001 · Especie Test')).toBeInTheDocument();
  });
});
