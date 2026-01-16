// src/auth/auth.module.ts

import { Module, Provider } from '@nestjs/common';
import { GlobalAuthGuard } from './guards/global-auth.guard';
import { AuthService } from './auth.service';
import { UserAuthRepository } from './repositories/userAuth.repository';
import { AuthStrategy } from './interfaces/auth-strategy.abstract';
import { DevAuthStrategy } from './strategies/dev-auth.strategy';
import { ClerkAuthStrategy } from './strategies/clerk-auth.strategy';
import { ConfigService } from '@nestjs/config';

// Factory provider to select the correct strategy based on the environment
const authStrategyProvider: Provider<AuthStrategy> = {
  provide: AuthStrategy,
  useFactory: (
    devStrategy: DevAuthStrategy,
    clerkStrategy: ClerkAuthStrategy,
    config: ConfigService,
  ) => {
    const env = config.get<string>('config.environment');
    console.log('🔧 AUTH STRATEGY FACTORY | config.environment =', env);

    if (env === 'development') {
      console.log('🔧 AUTH STRATEGY FACTORY | Using DevAuthStrategy');
      return devStrategy;
    }
    console.log('🔧 AUTH STRATEGY FACTORY | Using ClerkAuthStrategy');
    return clerkStrategy;
  },
  inject: [DevAuthStrategy, ClerkAuthStrategy, ConfigService],
};

@Module({
  providers: [
    GlobalAuthGuard,
    AuthService,
    UserAuthRepository,
    authStrategyProvider,
    DevAuthStrategy,
    ClerkAuthStrategy,
  ],

  exports: [GlobalAuthGuard, AuthService, AuthStrategy],
})
export class AuthModule {}
