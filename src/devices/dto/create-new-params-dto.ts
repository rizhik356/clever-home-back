import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateNewParamsDto {
  @ApiProperty({ example: 12, description: 'id' })
  @IsNotEmpty()
  readonly id: number;

  @ApiProperty({ example: 1, description: 'parentId' })
  readonly parentId: number;

  @ApiProperty({ example: false, description: 'power' })
  @IsNotEmpty()
  readonly power: boolean;
}
