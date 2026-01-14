import { ApiProperty } from '@nestjs/swagger';

export class DeleteUserFromFamilyDto {
  @ApiProperty({ example: '1', description: 'Id удаляемого пользователя' })
  userId: string;

  @ApiProperty({ example: '1', description: 'Id семьи' })
  familyId: string;
}
