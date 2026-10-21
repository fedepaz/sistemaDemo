// prisma/seed-devProductos.ts
// Dev-only: seeds two rows into the LEGACY martin3.articulo table so the
// on-read sync (GET /productos) can be verified end-to-end in local dev.
// Never seeded on production. User-executed: pnpm --filter backend db:seed:devProductos

import 'dotenv/config';
import mysql from 'mysql2/promise';

interface SeedRow {
  codigo: string;
  nombre: string;
}

const SEED_ROWS: SeedRow[] = [
  { codigo: 'PERLITA01', nombre: 'perlita' },
  { codigo: 'USHUAIA01', nombre: 'ushuaia' },
];

async function main() {
  const legacyUrl = process.env.DATABASE_LEGACY_URL;
  if (!legacyUrl) {
    throw new Error('DATABASE_LEGACY_URL is not set');
  }

  const url = new URL(legacyUrl);
  const connection = await mysql.createConnection({
    host: url.hostname,
    port: url.port ? parseInt(url.port, 10) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ''),
    charset: 'latin1',
  });

  try {
    for (const row of SEED_ROWS) {
      const [existing] = await connection.execute(
        'SELECT codigo FROM articulo WHERE codigo = ?',
        [row.codigo],
      );

      if ((existing as { codigo: string }[]).length > 0) {
        console.log(
          `⏭️  ${row.nombre}: skipped (codigo ${row.codigo} already exists)`,
        );
        continue;
      }

      await connection.execute(
        'INSERT INTO articulo (codigo, nombre, tipo, hai, unidad, rubro) VALUES (?, ?, ?, ?, ?, ?)',
        [row.codigo, row.nombre, 'PF', 'O', 'BOLSA', null],
      );
      console.log(
        `✅ ${row.nombre}: inserted (codigo ${row.codigo}, tipo=PF, hai=O)`,
      );
    }

    const [syncView] = await connection.execute(
      "SELECT codigo, nombre FROM articulo WHERE hai = 'O' AND tipo = 'PF' ORDER BY codigo",
    );
    console.log('\nRows the sync will see on GET /productos (hai=O, tipo=PF):');
    for (const r of syncView as { codigo: string; nombre: string }[]) {
      console.log(`  - ${r.codigo}: ${r.nombre}`);
    }
    console.log(
      '\nExpected after sync:\n' +
        '  - perlita: adopted onto the existing Prisma row (gains legacyCodigo, no Sistema Web badge)\n' +
        '  - ushuaia: created already linked (no Sistema Web badge)\n' +
        '  - kekila / rubia: keep their Sistema Web badges',
    );
  } finally {
    await connection.end();
  }
}

main().catch((e) => {
  console.error(`Error: ${e}`);
  process.exit(1);
});
