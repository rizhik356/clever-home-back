import { ApiProperty } from '@nestjs/swagger';

export class CreateConfirmEmailDto {
  @ApiProperty({ example: 'email@email.ru', description: 'Почта' })
  readonly email: string;
}
