import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JwtModule } from '@nestjs/jwt';
import { RefreshToken } from './entities/refresh-token.entity';
import { Role } from './entities/role.entity';
import { UserRole } from './entities/user-role.entity';
import { User } from './entities/user.entity';
import { TokenService } from './token.service';
import { OPTIONAL_DEPS_METADATA } from '@nestjs/common/constants';
import { Otp } from 'src/common/entities/otp.entity';
import { PasswordService } from './password.service';
import { EmailService } from 'src/common/utils/email.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, RefreshToken, Role, UserRole, Otp]),
  // Add any other modules that are needed, e.g., AuthModule, if applicable
  JwtModule.register({
    global: true,
  })
  ],
  controllers: [UsersController],
  providers: [UsersService, TokenService, PasswordService, EmailService],
})
export class UsersModule { }
