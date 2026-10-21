// src/modules/productos/legacy-producto-sync.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { LegacySustratoService } from '../legacy/sustrato/sustrato.service';
import { LegacyProductoDto } from '@vivero/shared';
import { Prisma } from '../../generated/prisma/client';

@Injectable()
export class LegacyProductoSyncService {
  private readonly logger = new Logger(LegacyProductoSyncService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly legacySustratoService: LegacySustratoService,
  ) {}

  async sync(): Promise<void> {
    try {
      const legacy = await this.legacySustratoService.getAllProductos();
      const legacyByCodigo = new Map<string, LegacyProductoDto>();
      for (const item of legacy) {
        if (!legacyByCodigo.has(item.codigo)) {
          legacyByCodigo.set(item.codigo, item);
        }
      }
      if (legacyByCodigo.size === 0) return;

      const rows = await this.prisma.producto.findMany({
        select: {
          id: true,
          nombre: true,
          legacyCodigo: true,
          deletedAt: true,
        },
      });

      const byLegacyCodigo = new Map<string, { id: string; nombre: string }>();
      const byNombre = new Map<
        string,
        {
          id: string;
          nombre: string;
          legacyCodigo: string | null;
          deletedAt: Date | null;
        }
      >();
      for (const row of rows) {
        if (row.legacyCodigo) {
          byLegacyCodigo.set(row.legacyCodigo, {
            id: row.id,
            nombre: row.nombre,
          });
        }
        if (!byNombre.has(row.nombre)) {
          byNombre.set(row.nombre, row);
        }
      }

      const ops: Prisma.PrismaPromise<unknown>[] = [];
      const takenNames = new Set<string>();

      for (const item of legacyByCodigo.values()) {
        const linked = byLegacyCodigo.get(item.codigo);
        if (linked) {
          if (linked.nombre !== item.nombre) {
            const target = byNombre.get(item.nombre) ?? undefined;
            const conflict =
              takenNames.has(item.nombre) ||
              (target !== undefined && target.id !== linked.id);
            if (conflict) {
              this.logger.warn(
                `Legacy producto ${item.codigo}: cannot rename to "${item.nombre}" (name taken); keeping "${linked.nombre}"`,
              );
            } else {
              ops.push(
                this.prisma.producto.update({
                  where: { id: linked.id },
                  data: { nombre: item.nombre },
                }),
              );
              takenNames.add(item.nombre);
            }
          }
          continue;
        }

        const match = byNombre.get(item.nombre);
        if (
          match &&
          match.deletedAt === null &&
          !match.legacyCodigo &&
          !takenNames.has(item.nombre)
        ) {
          ops.push(
            this.prisma.producto.update({
              where: { id: match.id },
              data: { legacyCodigo: item.codigo },
            }),
          );
          takenNames.add(item.nombre);
          continue;
        }
        if (match || takenNames.has(item.nombre)) {
          this.logger.warn(
            `Legacy producto ${item.codigo} ("${item.nombre}"): nombre unavailable (soft-deleted or already linked); skipped`,
          );
          continue;
        }
        ops.push(
          this.prisma.producto.create({
            data: { nombre: item.nombre, legacyCodigo: item.codigo },
          }),
        );
        takenNames.add(item.nombre);
      }

      if (ops.length > 0) {
        await this.prisma.$transaction(ops);
      }
    } catch (error) {
      this.logger.error(
        `Legacy producto sync failed: ${(error as Error).message}`,
      );
    }
  }
}
