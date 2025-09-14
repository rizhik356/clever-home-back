import { ApiProperty } from '@nestjs/swagger';

export class CreateHubOutputsDTO {
  @ApiProperty({ example: 12, description: 'parentId' })
  readonly parentId: number;
  @ApiProperty({ example: 'name', description: 'name' })
  readonly name: string;
  @ApiProperty({ example: 12, description: 'roomId' })
  readonly roomId: number;
  @ApiProperty({ example: 1, description: 'output' })
  readonly output: number;
  @ApiProperty({ example: 1, description: 'deviceId' })
  readonly deviceId: number;
}

export class CreatePatchHubOutputsDTO {
  @ApiProperty({ example: 12, description: 'id' })
  readonly id: number;
  @ApiProperty({ example: 'name', description: 'name' })
  readonly name: string;
  @ApiProperty({ example: 12, description: 'roomId' })
  readonly roomId: number;
  @ApiProperty({ example: 1, description: 'deviceId' })
  readonly deviceId: number;
}
