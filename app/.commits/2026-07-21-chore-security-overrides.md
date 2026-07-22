chore(security): fix all dependency vulnerabilities via pnpm overrides

Update and add pnpm overrides to resolve all 28 audit findings:
- js-yaml >=4.3.0 (was pinned to 4.1.1)
- shell-quote >=1.9.0 (new)
- sharp >=0.35.0 (new)
- multer >=2.2.0 (was >=2.1.1)
- hono >=4.12.27 (was >=4.12.14)
- @hono/node-server >=2.0.10 (was >=1.19.13)
- brace-expansion >=5.0.7 (was >=5.0.5)
- body-parser >=2.3.0 (was 2.2.1)
- qs >=6.15.2 (was >=6.14.2)
- @xhmikosr/decompress >=10.2.1 (new)
- piscina >=4.9.3 (new)
- ws >=8.21.0 (new)
- fast-uri >=3.1.4 (new)
- turbo >=2.9.14 (new)
- @babel/core >=7.29.6 (new)

Also updates scheduled.yml: pnpm/action-setup@v4, pnpm 10.33.2, node 22.
