import { ApiProperty } from '@nestjs/swagger';

export class CreateSiginDto {
  @ApiProperty({ example: 'email@email.ru', description: 'Логин / email' })
  readonly login: string;
  @ApiProperty({ example: 'password', description: 'Пароль' })
  readonly password: string;
}
