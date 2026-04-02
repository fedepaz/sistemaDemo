// app/modules/users/users.service.ts

import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UsersRepository } from './repositories/users.repository';
import { UpdateUserProfileDto } from '@vivero/shared';

@Injectable()
export class UsersService {
  constructor(private readonly repo: UsersRepository) {}

  async getAllUsers(requesterId: string) {
    const users = await this.repo.findAll(requesterId);
    return users;
  }

  async getUserById(userId: string, requesterId: string) {
    const user = await this.repo.findById(userId, requesterId);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async getProfile(userId: string, requesterId: string) {
    return this.getUserById(userId, requesterId);
  }

  async softRemoveById(userId: string, deletedByUserId: string) {
    return this.repo.softDelete(userId, deletedByUserId);
  }

  async updateProfile(username: string, data: UpdateUserProfileDto) {
    const user = await this.repo.findByUsername(username);
    if (!user) throw new NotFoundException('User not found');
    return this.repo.updateProfile(user.id, data);
  }

  async getUserByUsername(username: string) {
    const user = await this.repo.findByUsername(username);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async getUserByTenantId(tenantId: string) {
    const users = await this.repo.findByTenantId(tenantId);
    if (!users) throw new NotFoundException('Users not found');
    return users;
  }

  async softRemoveUserByUsername(username: string, deletedByUserId: string) {
    const user = await this.repo.findByUsername(username);
    if (!user) throw new NotFoundException('User not found');
    return this.repo.softDeleteByUsername(username, deletedByUserId);
  }

  async recoverUserById(id: string, requesterId: string) {
    try {
      return this.repo.recover(id, requesterId);
    } catch (error) {
      console.error('Error recovering user:', error);
      throw new InternalServerErrorException('Error recovering user');
    }
  }
}
