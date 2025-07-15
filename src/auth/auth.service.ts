import { BadRequestException, Injectable } from '@nestjs/common';
import { LoginInput, SignUpInput } from './dto/inputs';
import { AuthResponse } from './types/auth-response.type';
import { UsersService } from 'src/users/users.service';

import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {

    constructor(
        private readonly usersService: UsersService
    ) { }

    async signUp(signupInput: SignUpInput): Promise<AuthResponse> {
        const user = await this.usersService.create(signupInput);

        const token = 'adfdfdf';

        return { token, user };
    }

    async login(loginInput: LoginInput): Promise<AuthResponse> {
        const { email, password } = loginInput;
        const user = await this.usersService.findOneByEmail(email);

        if (!bcrypt.compareSync(password, user.password)) throw new BadRequestException(`Email/Password do not match`);

        const token = 'abcdfdf';
        return {
            token, user
        }
    }

}
