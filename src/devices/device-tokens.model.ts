import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from '../users/users.model';
import { Devices } from './devices.model';
import { DefaultRooms } from '../rooms/default-rooms.model';

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
    allowNull: false,
  })
  user_id: number;

  @ForeignKey(() => Devices)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  device_id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @ForeignKey(() => DefaultRooms)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  room_id: number;

  @Column({
    type: DataType.BOOLEAN,
  })
  is_used: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  token: string;
}
