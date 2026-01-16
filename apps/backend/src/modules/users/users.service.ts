// app/modules/users/users.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './repositories/users.repository';
import { UpdateUserProfileDto } from '@vivero/shared';

@Injectable()
export class UsersService {
  constructor(private readonly repo: UsersRepository) {}

  async getProfile(userId: string) {
    const user = await this.repo.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(userId: string, data: UpdateUserProfileDto) {
    return this.repo.updateProfile(userId, data);
  }
}
