// src/modules/productos/productos.service.ts

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { ProductosRepository } from './repositories/productos.repository';
import {
  CreateProductoDto,
  ProductoDto,
  UpdateProductoDto,
} from '@vivero/shared';

@Injectable()
export class ProductosService {
  constructor(private readonly repo: ProductosRepository) {}

  async getAllProductos(requesterId: string): Promise<ProductoDto[]> {
    const rows = await this.repo.findAll(requesterId);
    return rows.map((r) => ({
      id: r.id,
      nombre: r.nombre,
      isActive: r.isActive,
      createdAt: r.createdAt,
      deletedAt: r.deletedAt,
      deletedByUserId: r.deletedByUserId,
      deletedByUsername: r.deletedByUsername,
    }));
  }

  async getProductoById(
    requesterId: string,
    id: string,
  ): Promise<ProductoDto | null> {
    const row = await this.repo.findById(id, requesterId);
    if (!row) return null;
    return {
      id: row.id,
      nombre: row.nombre,
      isActive: row.isActive,
      createdAt: row.createdAt,
      deletedAt: row.deletedAt,
      deletedByUserId: row.deletedByUserId,
      deletedByUsername: row.deletedByUsername,
    };
  }

  async createProducto(data: CreateProductoDto): Promise<ProductoDto> {
    const row = await this.repo.create({
      nombre: data.nombre,
    });
    return {
      id: row.id,
      nombre: row.nombre,
      isActive: row.isActive,
      createdAt: row.createdAt,
      deletedAt: null,
      deletedByUserId: null,
      deletedByUsername: null,
    };
  }

  async updateProducto(
    requesterId: string,
    id: string,
    data: UpdateProductoDto,
  ): Promise<ProductoDto> {
    if (!data.nombre) {
      throw new BadRequestException('nombre is required');
    }

    const row = await this.repo.update(id, {
      nombre: data.nombre,
    });
    return {
      id: row.id,
      nombre: row.nombre,
      isActive: row.isActive,
      createdAt: row.createdAt,
      deletedAt: null,
      deletedByUserId: null,
      deletedByUsername: null,
    };
  }

  async deleteProducto(requesterId: string, id: string) {
    const row = await this.repo.findById(id, requesterId);
    if (!row) throw new NotFoundException('Producto not found');
    return this.repo.softDelete(id, requesterId);
  }
}
