import { ApiProperty } from '@nestjs/swagger';

export class CreateAddNewDeviceDto {
  @ApiProperty({ example: 12, description: 'userId' })
  readonly userId: number;
  @ApiProperty({ example: 'asdADSWRsdn', description: 'token' })
  readonly token: string;
  @ApiProperty({ example: 123, description: 'deviceId' })
  readonly deviceId: number;
}
