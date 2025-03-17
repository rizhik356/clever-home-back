import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
  BelongsTo,
} from 'sequelize-typescript';
import { UserDevices } from './user-devices.model';
import { DefaultRooms } from '../rooms/default-rooms.model';
import { Devices } from './devices.model';

@Table({ tableName: 'hub_outputs' })
export class HubOutputs extends Model<HubOutputs> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ForeignKey(() => UserDevices)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  hub_id: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  name: string;

  @ForeignKey(() => DefaultRooms)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  room_id: number;

  @ForeignKey(() => Devices)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  device_id: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  output: number;

  @BelongsTo(() => UserDevices)
  userDevice: UserDevices;

  @BelongsTo(() => Devices)
  device: Devices;

  @BelongsTo(() => DefaultRooms)
  room: DefaultRooms;
}
