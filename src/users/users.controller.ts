import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateConfirmEmailDto } from './dto/create-confirm-email-dto';
import { EmailConfirmationService } from './email-confirmation.service';
import { CreateConfirmCodeDto } from './dto/create-confirm-code-dto';
import { CreateChangePasswordDto } from './dto/create-change-password-dto';
import { ChangePasswordService } from './change-password.service';

@Controller('users')
export class UsersController {
  constructor(
    private userService: UsersService,
    private emailConfirmationService: EmailConfirmationService,
    private changePasswordService: ChangePasswordService,
  ) {}

  @ApiOperation({ summary: 'Проверка логина' })
  @ApiResponse({ status: 200 })
  @Get('login/:login')
  findLogin(@Param('login') login: string) {
    return this.userService.isLoginEmpty(login);
  }

  @ApiOperation({ summary: 'Проверка Email' })
  @ApiResponse({ status: 200 })
  @Get('email/:email')
  findOne(@Param('email') email: string) {
    return this.userService.isEmailEmpty(email);
  }

  @ApiOperation({ summary: 'Подтверждение Email' })
  @ApiResponse({ status: 200 })
  @Post('confirm-email')
  confirmEmail(@Body() confirmEmailDto: CreateConfirmEmailDto) {
    return this.emailConfirmationService.confirmEmail(confirmEmailDto);
  }

  @ApiOperation({ summary: 'Подтверждение code_verification' })
  @ApiResponse({ status: 200 })
  @Post('confirm-code')
  confirmCode(@Body() confirmCodeDto: CreateConfirmCodeDto) {
    return this.emailConfirmationService.confirmCode(confirmCodeDto);
  }

  @ApiOperation({ summary: 'Смена пароля' })
  @ApiResponse({ status: 200 })
  @Post('change-password')
  changePassword(@Body() confirmPasswordDto: CreateChangePasswordDto) {
    return this.changePasswordService.updatePasswordFromDto(confirmPasswordDto);
  }
}
