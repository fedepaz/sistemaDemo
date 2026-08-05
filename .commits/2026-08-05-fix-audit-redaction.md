fix(audit): redact password fields and handle nested objects

Add currentPassword and newPassword to REDACTED_KEYS to prevent
storing plaintext passwords in audit logs. Make sanitizeBody()
recursive to handle nested objects for defense in depth.
