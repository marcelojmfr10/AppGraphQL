import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';

@Module({
  providers: [AuthResolver, AuthService],
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    UsersModule,
  ],
})
export class AuthModule { }
