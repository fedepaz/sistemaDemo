// src/modules/legacy/config/config.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigRepository } from './repositories/config.repository';

@Injectable()
export class LegacyConfigService {
  constructor(private readonly repository: ConfigRepository) {}

  async getAllConfig() {
    const config = await this.repository.findAll();
    return config;
  }

  async getConfigByKey(key: string) {
    const config = await this.repository.findOne(key);
    if (!config) throw new NotFoundException('Config not found');
    return config;
  }
}
