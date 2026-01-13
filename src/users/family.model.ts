import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
  HasMany,
} from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './users.model';
import { FamilyMember } from './family-members.model';

@Table({ tableName: 'families' })
export class Family extends Model<Family> {
  @ApiProperty({ example: 1, description: 'Id семьи' })
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ApiProperty({ example: 'Семья', description: 'Название семьи' })
  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @ForeignKey(() => User)
  @ApiProperty({ example: 1, description: 'Id владельца' })
  @Column({ type: DataType.INTEGER, allowNull: false })
  owner_id: number;

  @ApiProperty({ example: true, description: 'Испольузется' })
  @Column({ type: DataType.BOOLEAN, allowNull: false })
  is_using: boolean;

  @BelongsTo(() => User, 'owner_id')
  owner: User;

  @HasMany(() => FamilyMember, {
    foreignKey: 'family_id',
    as: 'members',
  })
  members: FamilyMember[];
}
