import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { LoginInput, SignUpInput } from './dto/inputs';
import { AuthResponse } from './types/auth-response.type';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthResponse, {name: 'signup'})
  async signUp(
    @Args('signupInput') signupInput: SignUpInput
  ): Promise<AuthResponse> {
    return await this.authService.signUp(signupInput);
  }

  @Mutation(() => AuthResponse, {name: 'login'})
  async login(
    @Args('loginInput') loginInput: LoginInput
  ): Promise<AuthResponse> {
    return await this.authService.login(loginInput);
  }

  // @Query(,{name: 'revalite'})
  // async revalidateToken(){
  //   return this.authService.revalidateToken();
  // }
}
