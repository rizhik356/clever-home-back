import { ApiProperty } from '@nestjs/swagger';

export class CreateConfirmCodeDto {
  @ApiProperty({ example: 123456, description: 'Код' })
  readonly code: number;
}
