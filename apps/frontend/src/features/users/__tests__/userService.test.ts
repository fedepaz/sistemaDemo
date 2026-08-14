import { userService } from '../api/userService';

jest.mock('@/lib/api/client-fetch', () => ({
  clientFetch: jest.fn(),
}));

import { clientFetch } from '@/lib/api/client-fetch';
const mockClientFetch = clientFetch as jest.MockedFunction<typeof clientFetch>;

describe('userService.restorePassword', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls correct URL with PATCH and returns data', async () => {
    const dto = { userId: 'user-123' };
    const mockResponse = {
      success: true,
      message: 'Contraseña restaurada correctamente',
    };
    mockClientFetch.mockResolvedValue(mockResponse as never);

    const result = await userService.restorePassword(dto);

    expect(mockClientFetch).toHaveBeenCalledWith('auth/restore', {
      method: 'PATCH',
      body: JSON.stringify(dto),
    });
    expect(result).toEqual(mockResponse);
  });

  it('throws on network error', async () => {
    mockClientFetch.mockRejectedValue(new Error('Network error'));

    await expect(
      userService.restorePassword({ userId: 'user-123' }),
    ).rejects.toThrow('Network error');
  });
});
