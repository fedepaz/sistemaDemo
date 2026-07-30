fix(frontend): redirect to login on expired auth tokens

When JWT refresh fails, users were stuck on a loading spinner or saw
"No autorizado" with no way back. Now clientFetch redirects to /login
after clearing tokens, and the error provider handles "Sesión expirada"
the same way.
