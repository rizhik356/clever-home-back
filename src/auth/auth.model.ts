import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from '../users/users.model';

@Table({ tableName: 'auth_tokens' })
export class AuthTokens extends Model<AuthTokens> {
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
    unique: true,
  })
  user_id: number;

  @Column({
    type: DataType.STRING,
  })
  access_token: string;

  @Column({
    type: DataType.STRING,
  })
  refresh_token: string;

  @Column({
    type: DataType.DATE,
  })
  refresh_token_expires_at: string;
}
