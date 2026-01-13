import { ApiProperty } from '@nestjs/swagger';

export class InviteUserDto {
  @ApiProperty({ example: 1, description: 'Id семмьи' })
  readonly familyId: number;

  @ApiProperty({
    example: 'exaple@gmail.com',
    description: 'Email пользователя',
  })
  readonly email: string;

  @ApiProperty({ example: 1, description: 'Тип участника' })
  readonly memberId: number;
}
