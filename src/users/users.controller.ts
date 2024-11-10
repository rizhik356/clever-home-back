import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @ApiOperation({ summary: 'Проверка логина' })
  @ApiResponse({ status: 200 })
  @Get('login/:login')
  findLogin(@Param('login') login: string) {
    return this.userService.isLoginEmpty(login);
  }

  @ApiOperation({ summary: 'Проверка email' })
  @ApiResponse({ status: 200 })
  @Get('email/:email')
  findOne(@Param('email') email: string) {
    return this.userService.isEmailEmpty(email);
  }
}
