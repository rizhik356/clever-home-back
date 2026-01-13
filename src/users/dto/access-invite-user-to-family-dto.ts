import { ApiProperty } from '@nestjs/swagger';

export class AccessInviteUserDto {
  @ApiProperty({
    example: 'token',
    description: 'Токен',
  })
  readonly token: string;
}
