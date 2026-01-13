import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './users.model';

@Table({ tableName: 'invite-family-members' })
export class InviteFamilyMembers extends Model<InviteFamilyMembers> {
  @ApiProperty({ example: 1, description: 'Id' })
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ApiProperty({ example: 'token', description: 'Токен' })
  @Column({ type: DataType.STRING, allowNull: false })
  token: string;

  @ForeignKey(() => User)
  @ApiProperty({
    example: 1,
    description: 'Кто пригласил',
  })
  @Column({
    type: DataType.INTEGER,
  })
  invited_by: number;

  @ApiProperty({ example: true, description: 'Используется' })
  @Column({ type: DataType.BOOLEAN, allowNull: false })
  is_using: boolean;
}
