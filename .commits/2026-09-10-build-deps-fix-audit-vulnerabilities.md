build(deps): fix critical and high security vulnerabilities in dependencies

Bump pnpm overrides for sharp (>=0.35.4), multer (>=2.3.0), fast-uri
(>=4.1.3), and add new overrides for nanoid (>=3.3.18), deepmerge-ts
(>=8.0.0), mariadb (>=3.4.6), browserslist (>=4.28.7), prisma>mysql2
(>=3.22.0). Upgrade next to ^16.3.3 and mysql2 to ^3.22.0.

Resolves 2 critical (Next.js RCE) and 16 high vulnerabilities from
pnpm audit.
