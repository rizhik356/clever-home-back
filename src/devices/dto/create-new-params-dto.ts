import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateNewParamsDto {
  @ApiProperty({ example: 12, description: 'id' })
  @IsNotEmpty()
  readonly id: number;

  @ApiProperty({ example: false, description: 'power' })
  @IsNotEmpty()
  readonly power: boolean;
}
