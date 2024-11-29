import { Controller, Post, Body } from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create-user-dto';
import { AuthService } from './auth.service';
import { CreateSiginDto } from './dto/create-sign-in-dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('sign-in')
  sigIn(@Body() signInDto: CreateSiginDto) {
    return this.authService.signIn(signInDto);
  }

  @Post('sign-up')
  signUp(@Body() userDto: CreateUserDto) {
    return this.authService.signUp(userDto);
  }
}
