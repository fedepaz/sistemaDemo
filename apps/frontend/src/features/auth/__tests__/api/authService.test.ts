import { authService } from '../../api/authService';

jest.mock('@/lib/api/client-fetch', () => ({
  clientFetch: jest.fn(),
}));

import { clientFetch } from '@/lib/api/client-fetch';
const mockClientFetch = clientFetch as jest.MockedFunction<typeof clientFetch>;

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('calls correct URL with POST and body', async () => {
      const credentials = { username: 'admin', password: 'pass' };
      const mockResponse = {
        accessToken: 'token123',
        refreshToken: 'refresh123',
        user: { id: '1', username: 'admin' },
        isDefaultPassword: false,
      };
      mockClientFetch.mockResolvedValue(mockResponse as never);

      const result = await authService.login(credentials);

      expect(mockClientFetch).toHaveBeenCalledWith('auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      expect(result).toEqual(mockResponse);
    });

    it('throws on network error', async () => {
      mockClientFetch.mockRejectedValue(new Error('Network error'));

      await expect(
        authService.login({ username: 'admin', password: 'pass' }),
      ).rejects.toThrow('Network error');
    });
  });

  describe('logout', () => {
    it('calls correct URL with POST', async () => {
      mockClientFetch.mockResolvedValue(undefined as never);

      await authService.logout();

      expect(mockClientFetch).toHaveBeenCalledWith('auth/logout', {
        method: 'POST',
      });
    });

    it('throws on network error', async () => {
      mockClientFetch.mockRejectedValue(new Error('Network error'));

      await expect(authService.logout()).rejects.toThrow('Network error');
    });
  });

  describe('changePassword', () => {
    it('calls correct URL with PATCH and body', async () => {
      const data = { oldPassword: 'old', newPassword: 'new' };
      mockClientFetch.mockResolvedValue(undefined as never);

      await authService.changePassword(data);

      expect(mockClientFetch).toHaveBeenCalledWith('auth/password', {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    });

    it('throws on network error', async () => {
      mockClientFetch.mockRejectedValue(new Error('Network error'));

      await expect(
        authService.changePassword({ oldPassword: 'old', newPassword: 'new' }),
      ).rejects.toThrow('Network error');
    });
  });

  describe('getProfileMe', () => {
    it('calls correct URL with GET', async () => {
      const mockProfile = { id: '1', username: 'admin' };
      mockClientFetch.mockResolvedValue(mockProfile as never);

      const result = await authService.getProfileMe();

      expect(mockClientFetch).toHaveBeenCalledWith('users/me', {
        method: 'GET',
      });
      expect(result).toEqual(mockProfile);
    });

    it('throws on network error', async () => {
      mockClientFetch.mockRejectedValue(new Error('Network error'));

      await expect(authService.getProfileMe()).rejects.toThrow('Network error');
    });
  });

  describe('getPermissionsMe', () => {
    it('calls correct URL with GET', async () => {
      const mockPermissions = { canEdit: true };
      mockClientFetch.mockResolvedValue(mockPermissions as never);

      const result = await authService.getPermissionsMe();

      expect(mockClientFetch).toHaveBeenCalledWith('permissions/me', {
        method: 'GET',
      });
      expect(result).toEqual(mockPermissions);
    });

    it('throws on network error', async () => {
      mockClientFetch.mockRejectedValue(new Error('Network error'));

      await expect(authService.getPermissionsMe()).rejects.toThrow(
        'Network error',
      );
    });
  });
});