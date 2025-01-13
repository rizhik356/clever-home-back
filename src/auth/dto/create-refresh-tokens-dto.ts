import { ApiProperty } from '@nestjs/swagger';

export class CreateRefreshTokensDto {
  @ApiProperty({ example: 'pbiI6InRlc3RlciIsI', description: 'access_token' })
  readonly access_token: string;
  @ApiProperty({ example: 'pbiI6InRlc3Rlc', description: 'refresh_token' })
  readonly refresh_token: string;
  @ApiProperty({ example: '1', description: 'user_id' })
  readonly user_id: number;
}
