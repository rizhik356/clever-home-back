import { ApiProperty } from '@nestjs/swagger';

export class CreateAddNewDeviceDto {
  @ApiProperty({ example: '1', description: 'id' })
  readonly id: number;
  @ApiProperty({ example: 'asdADSWRsdn', description: 'token' })
  readonly token: string;
  @ApiProperty({ example: 'type', description: 'swithcer' })
  readonly type: string;
}
