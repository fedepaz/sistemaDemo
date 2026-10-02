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
      createdAt: r.createdAt,
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
      createdAt: row.createdAt,
    };
  }

  async createProducto(data: CreateProductoDto) {
    return await this.repo.create({
      nombre: data.nombre,
    });
  }

  async updateProducto(
    requesterId: string,
    id: string,
    data: UpdateProductoDto,
  ) {
    if (!data.nombre) {
      throw new BadRequestException('nombre is required');
    }

    return await this.repo.update(id, {
      nombre: data.nombre,
    });
  }

  async deleteProducto(requesterId: string, id: string) {
    const row = await this.repo.findById(id, requesterId);
    if (!row) throw new NotFoundException('Producto not found');
    return this.repo.softDelete(id, requesterId);
  }
}
