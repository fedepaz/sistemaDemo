// src/modules/productos/productos.controller.ts

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { RequirePermission } from '../permissions/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorators';
import { AuthUser } from '../auth/types/auth-user.type';
import { ProductosService } from './productos.service';
import {
  CreateProductoDto,
  CreateProductoSchema,
  ProductoDto,
  UpdateProductoDto,
  UpdateProductoSchema,
} from '@vivero/shared';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation-pipe';

@Controller('productos')
export class ProductosController {
  constructor(private readonly service: ProductosService) {}

  @Get()
  @RequirePermission({ tableName: 'productos', action: 'read', scope: 'ALL' })
  async getAllProductos(@CurrentUser() user: AuthUser): Promise<ProductoDto[]> {
    return this.service.getAllProductos(user.id);
  }

  @Post()
  @RequirePermission({ tableName: 'productos', action: 'create', scope: 'ALL' })
  async createProducto(
    @Body(new ZodValidationPipe(CreateProductoSchema))
    data: CreateProductoDto,
  ) {
    return this.service.createProducto(data);
  }

  @Get(':id')
  @RequirePermission({ tableName: 'productos', action: 'read', scope: 'ALL' })
  async getProducto(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<ProductoDto | null> {
    return this.service.getProductoById(user.id, id);
  }

  @Patch(':id')
  @RequirePermission({ tableName: 'productos', action: 'update', scope: 'ALL' })
  async updateProducto(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateProductoSchema))
    data: UpdateProductoDto,
  ) {
    return this.service.updateProducto(user.id, id, data);
  }

  @Delete(':id')
  @RequirePermission({ tableName: 'productos', action: 'delete', scope: 'ALL' })
  async deleteProducto(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.deleteProducto(user.id, id);
  }
}
