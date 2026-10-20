/* eslint-disable @typescript-eslint/unbound-method */
// src/modules/formula/__tests__/formula.controller.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { FormulaController } from '../formula.controller';
import { FormulaService } from '../formula.service';
import { REQUIRE_PERMISSION_KEY } from '../../permissions/decorators/require-permission.decorator';

describe('FormulaController', () => {
  let controller: FormulaController;
  let service: {
    getAllFormula: jest.Mock;
    getFormulaById: jest.Mock;
    createFormula: jest.Mock;
    deleteFormula: jest.Mock;
  };

  const mockUser = { id: 'user-1', username: 'admin', tenantId: 'tenant-1' };
  const mockDto = {
    id: 'formula-1',
    producto1Id: 'sust-1',
    porcentaje1: 60,
    producto2Id: 'sust-2',
    porcentaje2: 40,
    producto3Id: null,
    porcentaje3: null,
    producto4Id: null,
    porcentaje4: null,
  };

  beforeEach(async () => {
    service = {
      getAllFormula: jest.fn(),
      getFormulaById: jest.fn(),
      createFormula: jest.fn(),
      deleteFormula: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FormulaController],
      providers: [{ provide: FormulaService, useValue: service }],
    }).compile();

    controller = module.get<FormulaController>(FormulaController);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getAllFormula', () => {
    it('delegates to service with user id', async () => {
      service.getAllFormula.mockResolvedValue([mockDto]);

      const result = await controller.getAllFormula(mockUser);

      expect(result).toEqual([mockDto]);
      expect(service.getAllFormula).toHaveBeenCalledWith('user-1');
    });
  });

  describe('getFormula', () => {
    it('delegates to service with id and user id', async () => {
      service.getFormulaById.mockResolvedValue(mockDto);

      const result = await controller.getFormula(mockUser, 'formula-1');

      expect(result).toEqual(mockDto);
      expect(service.getFormulaById).toHaveBeenCalledWith(
        'formula-1',
        'user-1',
      );
    });
  });

  describe('createFormula', () => {
    it('delegates to service with data', async () => {
      service.createFormula.mockResolvedValue(mockDto);

      const data = {
        producto1Id: 'sust-1',
        porcentaje1: 60,
        producto2Id: 'sust-2',
        porcentaje2: 40,
        producto3Id: null,
        porcentaje3: null,
        producto4Id: null,
        porcentaje4: null,
      };
      const result = await controller.createFormula(data);

      expect(result).toEqual(mockDto);
      expect(service.createFormula).toHaveBeenCalledWith(data);
    });
  });

  describe('deleteFormula', () => {
    it('delegates to service with id and user id', async () => {
      service.deleteFormula.mockResolvedValue(mockDto);

      const result = await controller.deleteFormula(mockUser, 'formula-1');

      expect(result).toEqual(mockDto);
      expect(service.deleteFormula).toHaveBeenCalledWith('formula-1', 'user-1');
    });
  });

  describe('permission metadata', () => {
    it('GET /formula requires formulas:read', () => {
      const meta = Reflect.getMetadata(
        REQUIRE_PERMISSION_KEY,
        FormulaController.prototype.getAllFormula,
      );

      expect(meta).toEqual({
        tableName: 'formulas',
        action: 'read',
        scope: 'ALL',
      });
    });

    it('DELETE /formula/:id requires formulas:delete', () => {
      const meta = Reflect.getMetadata(
        REQUIRE_PERMISSION_KEY,
        FormulaController.prototype.deleteFormula,
      );

      expect(meta).toEqual({
        tableName: 'formulas',
        action: 'delete',
        scope: 'ALL',
      });
    });
  });
});
