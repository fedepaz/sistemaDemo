// src/auth/types/clerk-payload.type.ts
export interface ClerkJWTPayload {
  sub: string;
  email?: string;
  email_addresses?: string[];
  first_name?: string;
  given_name?: string;
  last_name?: string;
  family_name?: string;
  org_id?: string;
  public_metadata?: {
    tenantId?: string;
    [key: string]: any;
  };
  [key: string]: any;
}
