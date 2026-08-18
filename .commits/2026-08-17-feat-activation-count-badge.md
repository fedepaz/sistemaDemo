feat(users): add pending activation count badge on button

Show a small destructive badge with usersToActivate.length on the
"Activar usuarios" button. Badge only renders when user has canCreate
permission and there are pending users. aria-label includes count
for accessibility.
