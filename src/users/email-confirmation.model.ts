import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from './users.model';

@Table({ tableName: 'email_confirmation' })
export class EmailConfirmation extends Model<EmailConfirmation> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  user_id: number | null;

  @Column({
    type: DataType.INTEGER,
  })
  confirmation_code: number;

  @Column({
    type: DataType.BOOLEAN,
  })
  is_used: boolean;

  @Column({
    type: DataType.STRING,
  })
  token: string;

  @Column({
    type: DataType.STRING,
  })
  email: string;

  @Column({
    type: DataType.DATE,
  })
  expires_at: string;
}
