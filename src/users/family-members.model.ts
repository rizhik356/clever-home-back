import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
  BelongsTo,
} from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './users.model';
import { Family } from './family.model';
import { Member } from './member.model';

@Table({ tableName: 'family-members' })
export class FamilyMember extends Model<FamilyMember> {
  @ApiProperty({ example: 1, description: 'Id' })
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ForeignKey(() => User)
  @ApiProperty({ example: 1, description: 'Id пользователя' })
  @Column({ type: DataType.INTEGER, allowNull: false })
  user_id: number;

  @ForeignKey(() => Family)
  @ApiProperty({ example: 1, description: 'Id Семьи' })
  @Column({ type: DataType.INTEGER, allowNull: false })
  family_id: number;

  @ForeignKey(() => User)
  @ApiProperty({
    example: 1,
    description: 'Кто пригласил',
  })
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  invited_by: number;

  @ForeignKey(() => Member)
  @ApiProperty({ example: 1, description: 'Тип участника' })
  @Column({ type: DataType.INTEGER, allowNull: false })
  member_id: number;

  @ApiProperty({ example: true, description: 'Используется' })
  @Column({ type: DataType.BOOLEAN, allowNull: false })
  is_using: boolean;

  @BelongsTo(() => Family, 'family_id')
  family: Family;

  @BelongsTo(() => Member, 'member_id')
  member: Member;

  @BelongsTo(() => User, 'invited_by')
  invitedBy: User;

  @BelongsTo(() => User, {
    foreignKey: 'user_id',
    as: 'user',
  })
  userId: User;
}
