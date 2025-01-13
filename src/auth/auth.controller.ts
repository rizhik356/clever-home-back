import { Controller, Post, Body } from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create-user-dto';
import { AuthService } from './auth.service';
import { CreateSiginDto } from './dto/create-sign-in-dto';
import { CreateConfirmEmailDto } from '../users/dto/create-confirm-email-dto';
import { CreateConfirmCodeDto } from '../users/dto/create-confirm-code-dto';
import { CreateRefreshTokensDto } from './dto/create-refresh-tokens-dto';

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

  @Post('confirm-email')
  confirmEmail(@Body() emailDto: CreateConfirmEmailDto) {
    return this.authService.confirmEmail(emailDto);
  }

  @Post('confirm-code')
  confirmCode(@Body() codeDto: CreateConfirmCodeDto) {
    return this.authService.confirmCode(codeDto);
  }

  @Post('refresh-token')
  refreshToken(@Body() tokensDto: CreateRefreshTokensDto) {
    return this.authService.refreshTokens(tokensDto);
  }
}
