import { Controller, Post, Body, Res, Req } from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create-user-dto';
import { AuthService } from './auth.service';
import { CreateSiginDto } from './dto/create-sign-in-dto';
import { CreateConfirmEmailDto } from '../users/dto/create-confirm-email-dto';
import { CreateConfirmCodeDto } from '../users/dto/create-confirm-code-dto';
import { CreateRefreshTokensDto } from './dto/create-refresh-tokens-dto';
import { UserId } from './user-id.decorator';
import { Response, Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('sign-in')
  sigIn(@Body() signInDto: CreateSiginDto) {
    return this.authService.signIn(signInDto);
  }

  @Post('sign-up')
  signUp(
    @Body() userDto: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.signUp(userDto, res);
  }

  @Post('confirm-email')
  confirmEmail(@Body() emailDto: CreateConfirmEmailDto) {
    return this.authService.confirmEmail(emailDto);
  }

  @Post('confirm-code')
  confirmCode(@Body() codeDto: CreateConfirmCodeDto, @Req() request: Request) {
    const emailConfirmationId = request.cookies?.emailConfirmationId;
    return this.authService.confirmCode(codeDto, emailConfirmationId);
  }

  @Post('refresh-token')
  refreshToken(
    @UserId() user_id: number,
    @Body() tokensDto: CreateRefreshTokensDto,
  ) {
    return this.authService.refreshTokens({ ...tokensDto, user_id });
  }
}
