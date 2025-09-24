import { ApiProperty } from '@nestjs/swagger';

export class CreateChangePasswordDto {
  @ApiProperty({ example: 'password', description: 'пароль' })
  readonly password: string;
}
