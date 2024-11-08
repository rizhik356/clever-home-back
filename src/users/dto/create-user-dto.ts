import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'email@email.ru', description: 'Почта' })
  readonly email: string;
  @ApiProperty({ example: 'login', description: 'Логин' })
  readonly login: string;
  @ApiProperty({ example: 'password', description: 'Пароль' })
  readonly password: string;
}
