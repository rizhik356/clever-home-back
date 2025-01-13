import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateNewGetTokenDto {
  @ApiProperty({ example: 12, description: 'userId' })
  @IsNotEmpty()
  readonly userId: number;

  @ApiProperty({ example: 13, description: 'deviceId' })
  @IsNotEmpty()
  readonly deviceId: number;

  @IsNotEmpty()
  @ApiProperty({ example: 'Выклчючатель что надо', description: 'name' })
  readonly name: string;

  @IsNotEmpty()
  @ApiProperty({ example: 123, description: 'roomId' })
  readonly roomId: number;
}
