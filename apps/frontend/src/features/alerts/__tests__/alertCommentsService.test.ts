import { alertCommentsService } from '../api/alertCommentsService';

jest.mock('@/lib/api/client-fetch', () => ({
  clientFetch: jest.fn(),
}));

import { clientFetch } from '@/lib/api/client-fetch';
const mockClientFetch = clientFetch as jest.MockedFunction<typeof clientFetch>;

describe('alertCommentsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchComments', () => {
    it('calls correct URL and returns data', async () => {
      const mockData = [
        {
          id: 'c1',
          alertType: 'SIEMBRA_RETRASADA',
          partidaId: 1045,
          anio: 2026,
          indice: 0,
          content: 'Test comment',
          userId: 'u1',
          userName: 'admin',
          createdAt: '2026-07-31T10:00:00Z',
        },
      ];
      mockClientFetch.mockResolvedValue(mockData as never);

      const result = await alertCommentsService.fetchComments(
        'siembra-retrasada',
        1045,
        2026,
        0,
      );

      expect(mockClientFetch).toHaveBeenCalledWith(
        'alert-comments/siembra-retrasada/1045/2026/0',
        { method: 'GET' },
      );
      expect(result).toEqual(mockData);
    });

    it('throws on network error', async () => {
      mockClientFetch.mockRejectedValue(new Error('Network error'));

      await expect(
        alertCommentsService.fetchComments('siembra-retrasada', 1045, 2026, 0),
      ).rejects.toThrow('Network error');
    });
  });

  describe('createComment', () => {
    it('calls correct URL with POST and mapped alertType', async () => {
      const mockComment = {
        id: 'c2',
        alertType: 'SIEMBRA_RETRASADA',
        partidaId: 1045,
        anio: 2026,
        indice: 0,
        content: 'New comment',
        userId: 'u1',
        userName: 'admin',
        createdAt: '2026-07-31T11:00:00Z',
      };
      mockClientFetch.mockResolvedValue(mockComment as never);

      const result = await alertCommentsService.createComment({
        alertType: 'siembra-retrasada',
        partidaId: 1045,
        anio: 2026,
        indice: 0,
        content: 'New comment',
      });

      expect(mockClientFetch).toHaveBeenCalledWith('alert-comments', {
        method: 'POST',
        body: JSON.stringify({
          alertType: 'SIEMBRA_RETRASADA',
          partidaId: 1045,
          anio: 2026,
          indice: 0,
          content: 'New comment',
        }),
      });
      expect(result).toEqual(mockComment);
    });

    it('maps all 4 alert type slugs correctly', async () => {
      const slugs = [
        ['siembra-retrasada', 'SIEMBRA_RETRASADA'],
        ['falta-germinacion', 'FALTA_GERMINACION'],
        ['faltante-plantas', 'FALTANTE_PLANTAS'],
        ['falta-pre-expedicion', 'FALTA_PRE_EXPEDICION'],
      ] as const;

      for (const [slug, expected] of slugs) {
        mockClientFetch.mockResolvedValue({ alertType: expected } as never);

        await alertCommentsService.createComment({
          alertType: slug,
          partidaId: 1,
          anio: 2026,
          indice: 0,
          content: 'Test',
        });

        const callArgs = mockClientFetch.mock.calls[mockClientFetch.mock.calls.length - 1] as unknown[];
        const options = callArgs[1] as { body: string };
        const callBody = JSON.parse(options.body);
        expect(callBody.alertType).toBe(expected);
      }
    });

    it('throws on error', async () => {
      mockClientFetch.mockRejectedValue(new Error('Validation failed'));

      await expect(
        alertCommentsService.createComment({
          alertType: 'siembra-retrasada',
          partidaId: 1045,
          anio: 2026,
          indice: 0,
          content: 'Test',
        }),
      ).rejects.toThrow('Validation failed');
    });
  });
});
