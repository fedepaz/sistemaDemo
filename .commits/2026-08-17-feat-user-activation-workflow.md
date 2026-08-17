feat(auth,users): add user activation workflow and refactor auth layout

New users are now registered as inactive (isActive: false) and must be
activated by an admin before they can log in. Adds backend endpoint to
list pending users and frontend UI to display them.

Refactors auth layout to centralize Logo and form card styling, adds
sticky AuthHeader for login/register navigation, and renames register
route from /registrar to /register.

WIP: activation endpoint, skeleton components, and bug fixes pending.
