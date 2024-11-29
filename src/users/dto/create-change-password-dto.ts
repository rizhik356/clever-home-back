import { ApiProperty } from '@nestjs/swagger';

export class CreateChangePasswordDto {
  @ApiProperty({ example: 'token', description: 'токен' })
  readonly token: string;

  @ApiProperty({ example: 1, description: 'Id' })
  readonly id: number;

  @ApiProperty({ example: 'password', description: 'пароль' })
  readonly password: string;
}
