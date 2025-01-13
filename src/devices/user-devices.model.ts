import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from '../users/users.model';
import { Devices } from './devices.model';
import { DefaultRooms } from '../rooms/default-rooms.model';

@Table({ tableName: 'users_devices' })
export class UserDevices extends Model<UserDevices> {
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

  @ForeignKey(() => DefaultRooms)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  room_id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

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
  serial: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  active: boolean;

  @Column({
    type: DataType.JSON,
    allowNull: false,
  })
  params: JSON;

  @BelongsTo(() => DefaultRooms)
  room: DefaultRooms;

  @BelongsTo(() => Devices)
  device: Devices;
}
