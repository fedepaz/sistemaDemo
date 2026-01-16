// src/lib/api/backend.ts
"use server";

import { auth } from "@clerk/nextjs/server";

const backendUrl = process.env.BACKEND_URL;

if (!backendUrl) {
  console.warn("BACKEND_URL is not set");
}

/**
 * Get Autheticated Headers for backend requests
 */

async function getAuthHeaders() {
  const { getToken } = await auth();
  const token = await getToken();

  if (!token) {
    throw new Error("No token found");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

/**
 * Generic backend fecth function
 */
export async function backendFetch<T>(
  endpoint: string,
  options: {
    method: "GET" | "POST" | "PUT" | "DELETE";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body?: Record<string, any>;
    authRequired?: boolean;
    cache?: "no-store" | "no-cache" | "default";
  } = {
    method: "GET",
    body: undefined,
    authRequired: true,
    cache: "no-store",
  }
): Promise<T> {
  const {
    method = "GET",
    body,
    authRequired = true,
    cache = "no-store",
  } = options;

  try {
    const headers = authRequired
      ? await getAuthHeaders()
      : { "Content-Type": "application/json" };

    const res = await fetch(`${backendUrl}/${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      cache,
      next: { revalidate: 0 }, // Always fresh data
    });

    // Handle non 2xx responses
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));

      if (res.status === 401) {
        throw new Error("Unauthorized");
      }

      throw new Error(errorData.message || res.statusText);
    }

    return res.json() as Promise<T>;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error fetching data from ${endpoint}: ${error.message}`);
    }
    throw error;
  }
}
