fix(frontend): fix date display and form field labels in aSembrar

Fix timezone-induced date shift in formatShortDate by extracting
YYYY-MM-DD from full ISO strings before parsing. Use
AsignarUbiSiembraCompleta labels for form validation error banner.
Add lang es-AR for DD/MM/YYYY date input. Add observaciones textarea.
