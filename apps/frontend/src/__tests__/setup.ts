// apps/frontend/src/__tests__/setup.ts
import { beforeAll, afterEach, afterAll } from "vitest";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";

// Mock API handlers
export const handlers = [
  // Auth endpoints
  http.post("/api/auth/login", () => {
    return HttpResponse.json({
      user: {
        id: "123e4567-e89b-12d3-a456-426614174000",
        username: "testuser",
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
        tenantId: "123e4567-e89b-12d3-a456-426614174001",
      },
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
      isDefaultPassword: false,
    });
  }),

  http.post("/api/auth/register", () => {
    return HttpResponse.json({
      user: {
        id: "123e4567-e89b-12d3-a456-426614174002",
        username: "newuser",
        email: "new@example.com",
        firstName: "New",
        lastName: "User",
        tenantId: "123e4567-e89b-12d3-a456-426614174001",
      },
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
      isDefaultPassword: true,
    });
  }),

  // Users endpoints
  http.get("/api/users", () => {
    return HttpResponse.json({
      data: [],
      total: 0,
      page: 1,
      limit: 50,
      totalPages: 0,
    });
  }),

  // Entities endpoints
  http.get("/api/entities", () => {
    return HttpResponse.json({
      data: [],
      total: 0,
      page: 1,
      limit: 50,
      totalPages: 0,
    });
  }),
];

export const server = setupServer(...handlers);
