import { Controller, Post, Body } from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create-user-dto';
import { AuthService } from './auth.service';
import { CreateSiginDto } from './dto/create-sign-in-dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signIn')
  sigIn(@Body() signInDto: CreateSiginDto) {
    return this.authService.signIn(signInDto);
  }

  @Post('signUp')
  signUp(@Body() userDto: CreateUserDto) {
    return this.authService.signUp(userDto);
  }
}
