import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from '../users/users.model';

@Table({ tableName: 'device_tokens' })
export class DeviceTokens extends Model<DeviceTokens> {
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
  })
  user_id: number;

  @Column({
    type: DataType.BOOLEAN,
  })
  is_used: boolean;

  @Column({
    type: DataType.STRING,
  })
  token: string;
}
