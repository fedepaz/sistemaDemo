import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import {
  useAlertComments,
} from '../hooks/useAlertComments';
import { useAlertCommentsMutation } from '../hooks/useAlertCommentsMutation';

const mockFetchComments = jest.fn();
const mockCreateComment = jest.fn();

jest.mock('@/features/alerts/api/alertCommentsService', () => ({
  alertCommentsService: {
    fetchComments: (...args: unknown[]) => mockFetchComments(...args),
    createComment: (...args: unknown[]) => mockCreateComment(...args),
  },
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'QueryWrapper';
  return Wrapper;
};

describe('useAlertComments hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useAlertComments', () => {
    it('calls fetchComments with correct params and returns data', async () => {
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
      mockFetchComments.mockResolvedValue(mockData);

      const { result } = renderHook(
        () => useAlertComments('siembra-retrasada', 1045, 2026, 0),
        { wrapper: createWrapper() },
      );

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      expect(mockFetchComments).toHaveBeenCalledWith(
        'siembra-retrasada',
        1045,
        2026,
        0,
      );
      expect(result.current.data).toEqual(mockData);
    });
  });

  describe('useAlertCommentsMutation', () => {
    it('calls createComment and returns data', async () => {
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
      mockCreateComment.mockResolvedValue(mockComment);

      const { result } = renderHook(() => useAlertCommentsMutation(), {
        wrapper: createWrapper(),
      });

      const input = {
        alertType: 'siembra-retrasada' as const,
        partidaId: 1045,
        anio: 2026,
        indice: 0,
        content: 'New comment',
      };

      await result.current.mutateAsync(input);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockCreateComment).toHaveBeenCalled();
      expect(result.current.data).toEqual(mockComment);
    });
  });
});
